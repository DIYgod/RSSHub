import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import type { Page } from '@/utils/playwright';
import { getPlaywrightPage } from '@/utils/playwright';

const configurePage = async (page: Page) => {
    await page.route('**/*', async (route) => {
        await (['document', 'script', 'xhr'].includes(route.request().resourceType()) ? route.continue() : route.abort());
    });
};

export const route: Route = {
    path: '/track/:trackingNumber',
    categories: ['other'],
    example: '/ups/track/1Z78R6790470567520',
    parameters: { trackingNumber: 'The UPS tracking number (e.g., 1Z78R6790470567520).' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tracking',
    maintainers: ['Aquabet'],
    handler,
};

async function handler(ctx) {
    const { trackingNumber } = ctx.req.param();
    const url = `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`;

    const { page, destroy } = await getPlaywrightPage(url, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'domcontentloaded' },
        onBeforeLoad: configurePage,
    });
    try {
        const viewDetailsButton = '#st_App_View_Details';
        await page.waitForSelector(viewDetailsButton);
        await page.click(viewDetailsButton);

        await page.waitForSelector('tr[id^="stApp_activitydetails_row"]');

        const content = await page.content();

        const $ = load(content);

        const rows = $('tr[id^="stApp_activitydetails_row"]');

        const items: DataItem[] = rows.toArray().map((el, i) => {
            const dateTimeRaw = $(el).find(`#stApp_activitiesdateTime${i}`).text() || 'Not Provided';

            const dateTimeStr = dateTimeRaw
                .trim()
                .replace(/(\d+\/\d+\/\d{4})(\d+:\d+\s[AP]\.?M\.?)/, '$1 $2')
                .replaceAll('P.M.', 'PM')
                .replaceAll('A.M.', 'AM');

            const pubDate = parseDate(dateTimeStr);

            const activityCellText = $(el)
                .find(`#stApp_milestoneActivityLocation${i}`)
                .text()
                .trim()
                .replaceAll(/\s*\n\s*/g, '\n');

            const lines = activityCellText
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean);

            // Situation 0: There is text within the strong element
            // Example: ["Delivered", "DELIVERED", "REDMOND, WA, United States"]
            // Situation 1: strong is empty => the first line in lines is the status
            // Example: ["Departed from Facility", "Seattle, WA, United States"]
            const status = lines[0];
            const location = lines.at(-1) || '';

            const item: DataItem = {
                title: status,
                link: url,
                guid: `${trackingNumber}-${i}`,
                description: `
                Status: ${status} <br>
                Location: ${location} <br>
                Date and Time: ${dateTimeStr}
            `,
                pubDate,
            };

            return item;
        });

        return {
            title: `UPS Tracking - ${trackingNumber}`,
            link: url,
            item: items,
        };
    } finally {
        await destroy();
    }
}
