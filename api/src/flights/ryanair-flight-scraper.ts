import puppeteer from 'puppeteer-extra';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import type { Page, Browser } from 'puppeteer';

// Add stealth plugin to evade bot detection
puppeteer.use(StealthPlugin());

export interface ScrapedFlightDetails {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  duration: string;
  aircraft?: string;
}

export class RyanairFlightScraper {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
        timeout: 30000,
      });
    }
  }

  private async getAlternateFlightCodes(flightNumber: string): Promise<string[]> {
    try {
      const searchUrl = `https://www.flightradar24.com/v1/search/web/find?query=${flightNumber}&limit=18&type=schedule`;
      console.log(`Fetching alternate flight codes from: ${searchUrl}`);

      const response = await fetch(searchUrl);
      const data = await response.json();

      const flightCodes: string[] = [];

      // PRIORITY 1: Always try the original user-entered flight number first
      // This is what works on FlightRadar24's website (e.g., "DE1572")
      flightCodes.push(flightNumber);

      if (data.results && data.results.length > 0) {
        const result = data.results[0];

        // Priority 2: Extract codes from label like "VE7837 / EFY7837"
        if (result.label) {
          const codes = result.label.split('/').map((code: string) => code.trim());
          codes.forEach((code: string) => {
            if (code && !flightCodes.includes(code)) {
              flightCodes.push(code);
            }
          });
        }

        // Priority 3: Use the 'id' field as a fallback
        if (result.id && !flightCodes.includes(result.id)) {
          flightCodes.push(result.id);
        }

        // Priority 4: Add detail fields if not already included
        if (result.detail?.flight && !flightCodes.includes(result.detail.flight)) {
          flightCodes.push(result.detail.flight);
        }
        if (result.detail?.callsign && !flightCodes.includes(result.detail.callsign)) {
          flightCodes.push(result.detail.callsign);
        }
      }

      return flightCodes;
    } catch (error) {
      console.error('❌ Error fetching alternate flight codes:', error);
      return [flightNumber]; // Fallback to original
    }
  }

  async scrapeFlightByNumber(flightNumber: string, date: string): Promise<ScrapedFlightDetails | null> {
    let page: Page | null = null;

    try {
      await this.initialize();

      page = await this.browser!.newPage();

      // Set longer timeout since we're using stealth (slower but more reliable)
      page.setDefaultTimeout(60000); // 60 seconds max per operation

      // Set extra headers to look more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.flightradar24.com/',
      });

      // Format date as YYYY-MM-DD
      const searchDate = date;

      console.log(`Searching for flight ${flightNumber} on ${searchDate}`);

      // Get alternate flight codes from FlightRadar24 API (with timeout)
      const flightCodesPromise = this.getAlternateFlightCodes(flightNumber);
      const timeoutPromise = new Promise<string[]>((resolve) =>
        setTimeout(() => resolve([flightNumber]), 5000)
      );
      const flightCodes = await Promise.race([flightCodesPromise, timeoutPromise]);

      // Try each flight code with FlightRadar24 (primary source - most reliable)
      console.log('=== Attempting FlightRadar24 ===');
      for (const code of flightCodes) {
        console.log(`Trying flight code: ${code}`);
        const flightDetails = await this.scrapeFromFlightRadar24(page, code, searchDate);

        if (flightDetails) {
          console.log(`✓ FlightRadar24 succeeded with code: ${code}`);
          await page.close().catch(err => console.log('Error closing page:', err));
          return flightDetails;
        }
      }

      // Skip FlightAware and Google Flights to reduce scraping time
      // They are unreliable and slow. FlightRadar24 is the best source.
      console.log('⚠️ FlightRadar24 failed for all flight codes. Skipping other sources to save time.');

      await page.close().catch(err => console.log('Error closing page:', err));
      return null;

    } catch (error) {
      console.error('Error scraping flight details:', error);
      if (page) {
        await page.close().catch(err => console.log('Error closing page:', err));
      }
      return null;
    }
  }

  private async scrapeFromFlightRadar24(
    page: Page,
    flightNumber: string,
    date: string
  ): Promise<ScrapedFlightDetails | null> {
    try {
      // FlightRadar24 URL format - Note: FR24 doesn't support date-specific URLs
      // The page shows a table with multiple dates, we filter client-side
      const url = `https://www.flightradar24.com/data/flights/${flightNumber.toLowerCase()}`;

      console.log(`Trying FlightRadar24: ${url} (filtering for date: ${date})`);

      // Capture browser console logs for debugging (suppress to reduce noise)
      // page.on('console', msg => console.log('Browser:', msg.text()));

      // Try to load the page with multiple fallback strategies
      try {
        // First attempt: domcontentloaded (faster)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
      } catch (error) {
        console.log(`⚠️ domcontentloaded failed, trying networkidle2...`);
        try {
          // Second attempt: networkidle2
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        } catch (error2) {
          console.error(`❌ Both navigation strategies failed for ${url}`);
          throw error2;
        }
      }

      // Handle cookie consent popup (skip to save time - usually not needed)
      try {
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text && (text.includes('Agree') || text.includes('Accept'))) {
            await button.click();
            break;
          }
        }
      } catch (e) {
        // Ignore errors
      }

      // Reduced wait time for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try multiple possible selectors (FlightRadar24 changes their HTML)
      const possibleSelectors = [
        'table tbody tr',           // Generic table rows
        '.data-row',                // Old selector
        '[data-testid="flight-row"]', // Possible test ID
        'tr[class*="flight"]',      // Any tr with "flight" in class
      ];

      let rowsFound = false;
      for (const selector of possibleSelectors) {
        const exists = await page.$(selector);
        if (exists) {
          console.log(`Found elements with selector: ${selector}`);
          rowsFound = true;
          break;
        }
      }

      if (!rowsFound) {
        console.log('No flight data rows found on page');
        // Log what's actually on the page
        const pageContent = await page.content();
        console.log('Page HTML preview:', pageContent.substring(0, 500));
      }

      // Log page title to confirm we're on the right page
      const pageTitle = await page.title();
      console.log(`Page title: ${pageTitle}`);

      // Extract flight details with flexible selectors
      const flightData = await page.evaluate((searchDate) => {
        // Convert searchDate (YYYY-MM-DD) to FlightRadar24 format (DD MMM YYYY)
        const dateObj = new Date(searchDate);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const fr24Date = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

        console.log(`Looking for date: ${fr24Date} (from ${searchDate})`);

        // Try to find table rows with flight data
        const allRows = document.querySelectorAll('table tbody tr, .data-row, tr[class*="row"]');

        console.log(`Found ${allRows.length} rows on page`);

        // Also log all tables on the page
        const tables = document.querySelectorAll('table');
        console.log(`Found ${tables.length} tables on page`);

        if (allRows.length === 0) {
          console.log('No rows found, dumping body text:', document.body.textContent?.substring(0, 500));
          return null;
        }

        // Try to find the row for our date
        let targetRow: Element | null = null;

        for (const row of allRows) {
          const rowText = row.textContent || '';

          // Check if this row contains our date (FlightRadar24 format: "10 Dec 2025")
          if (rowText.includes(fr24Date)) {
            targetRow = row;
            console.log('Found matching row:', rowText.substring(0, 300));
            break;
          }
        }

        // If no date match, just take the first row (most recent flight)
        if (!targetRow && allRows.length > 0) {
          targetRow = allRows[0];
          console.log('No date match, using first row:', targetRow.textContent?.substring(0, 300));
        }

        if (!targetRow) {
          console.log('Could not find target row');
          return null;
        }

        // Try to extract data with multiple possible selectors
        const cells = targetRow.querySelectorAll('td');
        console.log(`Found ${cells.length} cells in row`);

        // Log all cell contents for debugging
        cells.forEach((cell, i) => {
          console.log(`Cell ${i}: ${cell.textContent?.trim()}`);
        });

        // FlightRadar24 actual table structure (based on cell logs):
        // Cell 0: [combined data], Cell 1: [empty], Cell 2: DATE
        // Cell 3: FROM, Cell 4: TO, Cell 5: AIRCRAFT, Cell 6: FLIGHT TIME
        // Cell 7: STD, Cell 8: ATD, Cell 9: STA, Cell 10+: STATUS
        let origin = '', destination = '', depTime = '', arrTime = '', duration = '', aircraft = '';

        if (cells.length >= 10) {
          // Extract from actual cell positions
          const fromText = cells[3]?.textContent?.trim() || '';
          const toText = cells[4]?.textContent?.trim() || '';

          // Extract airport codes from "City (CODE)" format
          const fromMatch = fromText.match(/\(([A-Z]{3})\)/);
          const toMatch = toText.match(/\(([A-Z]{3})\)/);

          origin = fromMatch ? fromMatch[1] : '';
          destination = toMatch ? toMatch[1] : '';

          aircraft = cells[5]?.textContent?.trim() || '';
          duration = cells[6]?.textContent?.trim() || '';

          // STD = Scheduled Time of Departure (cell 7)
          // ATD = Actual Time of Departure (cell 8) - use this if available
          // STA = Scheduled Time of Arrival (cell 9)
          const stdText = cells[7]?.textContent?.trim() || '';
          const atdText = cells[8]?.textContent?.trim() || '';
          const staText = cells[9]?.textContent?.trim() || '';

          // Prefer actual time over scheduled time
          depTime = (atdText && atdText !== '—') ? atdText : stdText;
          arrTime = staText;

          console.log('Extracted:', { origin, destination, depTime, arrTime, duration, aircraft });
        } else {
          // Fallback: try to parse from text content
          console.log('Not enough cells, trying text parsing fallback');

          for (const cell of cells) {
            const text = cell.textContent?.trim() || '';

            // Look for airport codes in parentheses
            const airportMatch = text.match(/\(([A-Z]{3})\)/);
            if (airportMatch) {
              if (!origin) {
                origin = airportMatch[1];
              } else if (!destination) {
                destination = airportMatch[1];
              }
            }

            // Look for times (HH:MM AM/PM)
            const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/);
            if (timeMatch) {
              if (!depTime) {
                depTime = timeMatch[1];
              } else if (!arrTime) {
                arrTime = timeMatch[1];
              }
            }

            // Look for duration
            if (text.match(/\d+:\d{2}/) && text !== depTime && text !== arrTime) {
              duration = text;
            }
          }
        }

        return {
          origin,
          destination,
          departureTime: depTime,
          arrivalTime: arrTime,
          duration,
          aircraft,
        };
      }, date);

      if (!flightData || !flightData.origin) {
        return null;
      }

      // Parse times and create ISO datetime strings
      const departureDateTime = `${date}T${this.parseTime(flightData.departureTime)}:00`;
      let arrivalDateTime = `${date}T${this.parseTime(flightData.arrivalTime)}:00`;

      // If arrival time is before departure, it's next day
      if (flightData.arrivalTime < flightData.departureTime) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const pad = (n: number) => n.toString().padStart(2, '0');
        arrivalDateTime = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}T${this.parseTime(flightData.arrivalTime)}:00`;
      }

      return {
        flightNumber: flightNumber.toUpperCase(),
        origin: flightData.origin,
        destination: flightData.destination,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        departureDate: departureDateTime,
        arrivalDate: arrivalDateTime,
        duration: flightData.duration,
        aircraft: flightData.aircraft,
      };

    } catch (error) {
      console.error('FlightRadar24 scraping failed:', error);
      return null;
    }
  }

  // FlightAware scraper removed - FlightRadar24 is more reliable and faster

  private parseTime(timeStr: string): string {
    // Convert time strings like "14:30" or "8:05 PM" to 24-hour format
    // First check for AM/PM format
    const amPmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (amPmMatch) {
      let hour = parseInt(amPmMatch[1]);
      const minute = amPmMatch[2];
      const period = amPmMatch[3].toUpperCase();

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }

    // If no AM/PM, assume it's already 24-hour format
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return '00:00';
  }

  // Google Flights and FlightAware scrapers removed - FlightRadar24 is more reliable and faster

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
