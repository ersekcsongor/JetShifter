import * as puppeteer from 'puppeteer';

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
  private browser: puppeteer.Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
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

      if (data.results && data.results.length > 0) {
        const result = data.results[0];

        // Priority 1: Use the 'id' field - this is what FlightRadar24 URLs use
        // For example: user searches "EFY7837", API returns id: "VE7837"
        // FlightRadar24 URL needs: /data/flights/ve7837
        if (result.id) {
          console.log(`✓ Primary flight code from API id field: ${result.id}`);
          flightCodes.push(result.id);
        }

        // Priority 2: Extract codes from label like "VE7837 / EFY7837"
        if (result.label) {
          const codes = result.label.split('/').map((code: string) => code.trim());
          codes.forEach((code: string) => {
            if (code && !flightCodes.includes(code)) {
              flightCodes.push(code);
            }
          });
        }

        // Priority 3: Add detail fields if not already included
        if (result.detail?.flight && !flightCodes.includes(result.detail.flight)) {
          flightCodes.push(result.detail.flight);
        }
        if (result.detail?.callsign && !flightCodes.includes(result.detail.callsign)) {
          flightCodes.push(result.detail.callsign);
        }
      }

      // Fallback: if API didn't return anything, use original search term
      if (flightCodes.length === 0) {
        console.log('⚠ No results from FlightRadar24 API, using original search term');
        flightCodes.push(flightNumber);
      }

      console.log(`📋 Flight codes to try (in priority order): ${flightCodes.join(', ')}`);
      return flightCodes;
    } catch (error) {
      console.error('❌ Error fetching alternate flight codes:', error);
      return [flightNumber]; // Fallback to original
    }
  }

  async scrapeFlightByNumber(flightNumber: string, date: string): Promise<ScrapedFlightDetails | null> {
    try {
      await this.initialize();

      const page = await this.browser!.newPage();

      // Set user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Format date as YYYY-MM-DD
      const searchDate = date;

      console.log(`Searching for flight ${flightNumber} on ${searchDate}`);

      // Get alternate flight codes from FlightRadar24 API
      const flightCodes = await this.getAlternateFlightCodes(flightNumber);

      // Try each flight code with FlightRadar24
      console.log('=== Attempting FlightRadar24 ===');
      for (const code of flightCodes) {
        console.log(`Trying flight code: ${code}`);
        const flightDetails = await this.scrapeFromFlightRadar24(page, code, searchDate);

        if (flightDetails) {
          console.log(`✓ FlightRadar24 succeeded with code: ${code}`);
          await page.close();
          return flightDetails;
        }
      }

      // Fallback: Try FlightAware with all codes
      console.log('=== Attempting FlightAware ===');
      for (const code of flightCodes) {
        console.log(`Trying flight code: ${code}`);
        const flightAwareDetails = await this.scrapeFromFlightAware(page, code, searchDate);

        if (flightAwareDetails) {
          console.log(`✓ FlightAware succeeded with code: ${code}`);
          await page.close();
          return flightAwareDetails;
        }
      }

      // Last resort: Try Google Flights with all codes
      console.log('=== Attempting Google Flights ===');
      for (const code of flightCodes) {
        console.log(`Trying flight code: ${code}`);
        const googleFlightsDetails = await this.scrapeFromGoogleFlights(page, code, searchDate);

        if (googleFlightsDetails) {
          console.log(`✓ Google Flights succeeded with code: ${code}`);
          await page.close();
          return googleFlightsDetails;
        }
      }

      await page.close();
      return null;

    } catch (error) {
      console.error('Error scraping flight details:', error);
      return null;
    }
  }

  private async scrapeFromFlightRadar24(
    page: puppeteer.Page,
    flightNumber: string,
    date: string
  ): Promise<ScrapedFlightDetails | null> {
    try {
      // FlightRadar24 URL format - Note: FR24 doesn't support date-specific URLs
      // The page shows a table with multiple dates, we filter client-side
      const url = `https://www.flightradar24.com/data/flights/${flightNumber.toLowerCase()}`;

      console.log(`Trying FlightRadar24: ${url} (filtering for date: ${date})`);

      // Capture browser console logs for debugging
      page.on('console', msg => console.log('Browser:', msg.text()));

      // Increase timeout to 60 seconds for slow connections
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Handle cookie consent popup
      try {
        console.log('Checking for cookie consent...');
        const consentButton = await page.$('button:contains("Agree and close"), button:contains("Accept"), button[class*="consent"]');
        if (consentButton) {
          console.log('Clicking cookie consent button...');
          await consentButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Try alternative selectors
          const buttons = await page.$$('button');
          for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && (text.includes('Agree') || text.includes('Accept') || text.includes('close'))) {
              console.log(`Found consent button with text: ${text}`);
              await button.click();
              await new Promise(resolve => setTimeout(resolve, 1000));
              break;
            }
          }
        }
      } catch (e) {
        console.log('No cookie consent found or already accepted');
      }

      // Wait a bit longer for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));

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

  private async scrapeFromFlightAware(
    page: puppeteer.Page,
    flightNumber: string,
    date: string
  ): Promise<ScrapedFlightDetails | null> {
    try {
      // First, use FlightAware omnisearch API to get the correct flight identifier
      const flightIdent = await this.getFlightAwareIdentifier(flightNumber);

      if (!flightIdent) {
        console.log(`FlightAware omnisearch: No identifier found for ${flightNumber}`);
        return null;
      }

      console.log(`FlightAware omnisearch: Found identifier ${flightIdent} for ${flightNumber}`);

      // FlightAware URL format with the correct identifier
      const url = `https://flightaware.com/live/flight/${flightIdent}`;

      console.log(`Trying FlightAware: ${url} (filtering for date: ${date})`);

      // Increase timeout and use domcontentloaded for faster response
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait for flight data with increased timeout
      await page.waitForSelector('.flightPageSummaryCity, .flightPageSummary, [class*="flight"]', { timeout: 15000 }).catch(() => null);

      const flightData = await page.evaluate(() => {
        const originEl = document.querySelector('.flightPageSummaryCity.origin');
        const destEl = document.querySelector('.flightPageSummaryCity.destination');
        const timeEls = document.querySelectorAll('.flightPageSummaryDateTime');

        const origin = originEl?.querySelector('.flightPageIdent')?.textContent?.trim() || '';
        const destination = destEl?.querySelector('.flightPageIdent')?.textContent?.trim() || '';

        const depTime = timeEls[0]?.textContent?.trim() || '';
        const arrTime = timeEls[1]?.textContent?.trim() || '';

        return {
          origin,
          destination,
          departureTime: depTime,
          arrivalTime: arrTime,
        };
      });

      if (!flightData.origin) {
        return null;
      }

      // Parse the times from FlightAware format
      const departureDateTime = `${date}T${this.parseFlightAwareTime(flightData.departureTime)}:00`;
      const arrivalDateTime = `${date}T${this.parseFlightAwareTime(flightData.arrivalTime)}:00`;

      return {
        flightNumber: flightNumber.toUpperCase(),
        origin: flightData.origin,
        destination: flightData.destination,
        departureTime: this.parseFlightAwareTime(flightData.departureTime),
        arrivalTime: this.parseFlightAwareTime(flightData.arrivalTime),
        departureDate: departureDateTime,
        arrivalDate: arrivalDateTime,
        duration: 'N/A',
      };

    } catch (error) {
      console.error('FlightAware scraping failed:', error);
      return null;
    }
  }

  /**
   * Use FlightAware omnisearch API to get the correct flight identifier
   * Example: "de1572" -> "CFG1572"
   */
  private async getFlightAwareIdentifier(flightNumber: string): Promise<string | null> {
    try {
      const searchUrl = `https://www.flightaware.com/ajax/ignoreall/omnisearch/flight.rvt?v=50&locale=en_US&searchterm=${flightNumber}&q=${flightNumber}`;
      console.log(`FlightAware omnisearch API: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        console.error(`FlightAware API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const result = data.data[0];
        const ident = result.ident;

        if (ident) {
          console.log(`✓ FlightAware omnisearch: Found ${ident} for ${flightNumber}`);
          console.log(`  Description: ${result.description || 'N/A'}`);
          return ident;
        }
      }

      console.log(`⚠ FlightAware omnisearch: No results for ${flightNumber}`);
      return null;
    } catch (error) {
      console.error('❌ FlightAware omnisearch API error:', error);
      return null;
    }
  }

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

  private parseFlightAwareTime(timeStr: string): string {
    // Parse FlightAware time format (e.g., "2:30PM EST")
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = match[2];
      const period = match[3].toUpperCase();

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }
    return '00:00';
  }

  private async scrapeFromGoogleFlights(
    page: puppeteer.Page,
    flightNumber: string,
    date: string
  ): Promise<ScrapedFlightDetails | null> {
    try {
      // Extract airline code and number (e.g., "FR713" -> "FR" and "713")
      const match = flightNumber.match(/([A-Z]{2,3})(\d+)/i);
      if (!match) {
        console.log('Invalid flight number format');
        return null;
      }

      const airlineCode = match[1].toUpperCase();
      const flightNum = match[2];

      // Google Flights search URL
      const url = `https://www.google.com/travel/flights?q=${airlineCode}%20${flightNum}`;

      console.log(`Trying Google Flights: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Handle cookie consent (Google often shows this)
      try {
        console.log('Checking for Google cookie consent...');
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text && (text.includes('Accept') || text.includes('agree') || text.includes('I agree'))) {
            console.log(`Clicking Google consent: ${text}`);
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            break;
          }
        }
      } catch (e) {
        console.log('No Google consent popup');
      }

      // Wait for flight data to load
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Take screenshot for debugging
      try {
        await page.screenshot({ path: `debug-google-${flightNumber}.png`, fullPage: false });
        console.log(`Google screenshot saved: debug-google-${flightNumber}.png`);
      } catch (e) {
        console.log('Could not save Google screenshot');
      }

      // Extract flight details from Google Flights
      const flightData = await page.evaluate(() => {
        // Google Flights uses various selectors
        const getText = (selector: string): string => {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || '';
        };

        // Try to find airport codes (usually in format "XXX - City Name")
        const airportElements = document.querySelectorAll('[class*="airport"], [class*="city"]');
        const airports: string[] = [];

        airportElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          const match = text.match(/([A-Z]{3})/);
          if (match && airports.length < 2) {
            airports.push(match[1]);
          }
        });

        // Try to find times
        const timeElements = document.querySelectorAll('[class*="time"], [class*="departure"], [class*="arrival"]');
        const times: string[] = [];

        timeElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          const timeMatch = text.match(/(\d{1,2}:\d{2})/);
          if (timeMatch && times.length < 2) {
            times.push(timeMatch[1]);
          }
        });

        // Try to find duration
        let duration = '';
        const durationElements = document.querySelectorAll('[class*="duration"], [class*="time"]');

        for (const el of durationElements) {
          const text = el.textContent?.trim() || '';
          if (text.match(/\d+\s*(hr|hour|h)\s*\d*\s*(min|m)?/i)) {
            duration = text;
            break;
          }
        }

        // Get all text content as fallback
        const bodyText = document.body.textContent || '';

        // Try to extract from body text if structured data not found
        if (airports.length < 2) {
          const airportMatches = bodyText.match(/\b([A-Z]{3})\b/g);
          if (airportMatches && airportMatches.length >= 2) {
            airports.push(...airportMatches.slice(0, 2));
          }
        }

        if (times.length < 2) {
          const timeMatches = bodyText.match(/\b(\d{1,2}:\d{2})\b/g);
          if (timeMatches && timeMatches.length >= 2) {
            times.push(...timeMatches.slice(0, 2));
          }
        }

        return {
          origin: airports[0] || '',
          destination: airports[1] || '',
          departureTime: times[0] || '',
          arrivalTime: times[1] || '',
          duration: duration || 'N/A',
          bodyPreview: bodyText.substring(0, 300),
        };
      });

      console.log('Google Flights data:', flightData);

      if (!flightData.origin || !flightData.destination) {
        console.log('Could not extract flight data from Google Flights');
        console.log('Body preview:', flightData.bodyPreview);
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
      };

    } catch (error) {
      console.error('Google Flights scraping failed:', error);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
