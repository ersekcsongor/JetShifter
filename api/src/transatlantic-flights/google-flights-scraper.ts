const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

export interface ScrapedFlight {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price?: string;
  stops: number;
}

export class GoogleFlightsScraper {
  private browser: any = null;

  // Initialize browser
  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
    }
  }

  // Close browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Scrape Google Flights for a specific route and date
  async scrapeFlights(
    origin: string,
    destination: string,
    date: string, // YYYY-MM-DD format
  ): Promise<ScrapedFlight[]> {
    await this.initialize();

    const page = await this.browser.newPage();

    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      // Construct Google Flights URL
      const url = `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${date}`;

      console.log(`Scraping: ${url}`);

      // Navigate to Google Flights
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Wait for flight results to load
      await page.waitForSelector('.pIav2d', { timeout: 30000 });

      // Additional wait to ensure all flights are loaded
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Extract flight data
      const flights = await page.evaluate(() => {
        const flightElements = document.querySelectorAll('.pIav2d');
        const results: any[] = [];

        flightElements.forEach((element: Element) => {
          try {
            // Extract airline name
            const airlineElement = element.querySelector('.sSHqwe.tPgKwe.ogfYpf');
            const airline = airlineElement?.textContent?.trim() || 'Unknown';

            // Extract departure time
            const departureElement = element.querySelector('.wtdjmc .deN3Mb span[aria-label]');
            const departureTime = departureElement?.getAttribute('aria-label') || '';

            // Extract arrival time
            const arrivalElements = element.querySelectorAll('.wtdjmc .XWcVob span[aria-label]');
            const arrivalTime = arrivalElements.length > 0
              ? arrivalElements[arrivalElements.length - 1]?.getAttribute('aria-label') || ''
              : '';

            // Extract duration
            const durationElement = element.querySelector('.gvkrdb.AdWm1c.tPgKwe.ogfYpf');
            const duration = durationElement?.textContent?.trim() || '';

            // Extract stops
            const stopsElement = element.querySelector('.BbR8Ec .ogfYpf');
            const stopsText = stopsElement?.textContent?.trim() || 'Nonstop';
            const stops = stopsText.includes('Nonstop') ? 0 :
                         stopsText.includes('1 stop') ? 1 :
                         parseInt(stopsText) || 0;

            // Extract price (optional)
            const priceElement = element.querySelector('.YMlIz.FpEdX span');
            const price = priceElement?.textContent?.trim() || '';

            if (departureTime && arrivalTime && duration) {
              results.push({
                airline,
                flightNumber: `${airline.split(' ')[0]}-${Date.now()}`, 
                departureTime,
                arrivalTime,
                duration,
                price,
                stops,
              });
            }
          } catch (error) {
            console.error('Error extracting flight data:', error);
          }
        });

        return results;
      });

      console.log(`Found ${flights.length} flights for ${origin} → ${destination}`);
      return flights;

    } catch (error) {
      console.error(`Error scraping flights for ${origin} → ${destination}:`, error.message);
      return [];
    } finally {
      await page.close();
    }
  }

  // Batch scrape multiple routes
  async scrapeMultipleRoutes(
    routes: Array<{ origin: string; destination: string; date: string }>,
    delayMs: number = 10000, // 10 second delay between requests to avoid blocking
  ): Promise<Map<string, ScrapedFlight[]>> {
    await this.initialize();

    const results = new Map<string, ScrapedFlight[]>();

    for (const route of routes) {
      const key = `${route.origin}-${route.destination}-${route.date}`;
      const flights = await this.scrapeFlights(route.origin, route.destination, route.date);
      results.set(key, flights);

      // Delay between requests to avoid rate limiting
      if (routes.indexOf(route) < routes.length - 1) {
        console.log(`Waiting ${delayMs / 1000}s before next request...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    await this.close();
    return results;
  }
}
