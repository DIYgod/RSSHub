import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/track/:trackingNumber',
    categories: ['other'],
    example: '/ups/track/1Z78R6790470567520',
    parameters: { trackingNumber: 'The UPS tracking number (e.g., 1Z78R6790470567520).' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ups.com/track?loc=en_US&tracknum=:trackingNumber'],
            target: '/ups/track/:trackingNumber',
        },
    ],
    name: 'UPS Tracking',
    maintainers: ['Aquabet'],
    handler,
};

async function handler(ctx) {
    const { trackingNumber } = ctx.req.param();
    const url = `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`;

    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.setUserAgent(config.ua);

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.setRequestInterception(true);

    // skip loading images, stylesheets, and fonts
    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
            request.abort();
        } else {
            request.continue();
        }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('tr[id^="stApp_ShpmtProg_LVP_progress_row_"]', {
        timeout: 30000,
    });

    const content = await page.content();
    browser.close();
    const $ = load(content);

    // Extract tracking events
    const items = $('tr[id^="stApp_ShpmtProg_LVP_progress_row_"]')
        .toArray()
        .flatMap((el) => {
            const $el = $(el);

            // Extract status, location, and datetime
            const status = $el
                .find(`td[id^="stApp_ShpmtProg_LVP_milestone_nameKey_"]`)
                .contents()
                .filter(function () {
                    return this.type === 'text' && this.data.trim() !== '';
                })
                .toArray()
                .map((element) => element.data)
                .join('')
                .trim();

            const location = $el.find(`span[id^="stApp_milestoneLocation"]`).text().trim();
            const dateTimeText = $el.find(`span[id^="stApp_milestoneDateTime"]`).text().trim();

            if (!dateTimeText) {
                return [];
            }

            const cleanedDateTimeText = dateTimeText.normalize('NFKC').replaceAll(/\s+/g, ' ').replaceAll('A.M.', 'AM').replaceAll('P.M.', 'PM').trim();

            // Separate date and time
            const [date, time] = cleanedDateTimeText.split(', ');
            const formattedDateTime = `${date} ${time}`;

            return {
                title: `${status}: ${location}`,
                link: url,
                description: `
                    Status: ${status} <br>
                    Location: ${location} <br>
                    Date and Time: ${date} ${time}
                `.trim(),
                pubDate: parseDate(formattedDateTime, 'MM/DD/YYYY h:mm A'),
            };
        });

    // Return RSS data
    return {
        title: `UPS Tracking - ${trackingNumber}`,
        link: url,
        item: items,
    };
}
