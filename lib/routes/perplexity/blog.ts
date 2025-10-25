import { Route, DataItem, Data, ViewType } from '@/types';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    example: 'https://www.perplexity.ai/hub/announcing-comet-plus-launch-partners',
    url: 'perplexity.ai',
    categories: ['blog'],
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.perplexity.ai'],
            target: '/hub',
        },
    ],
    name: 'Perplexity Blog',
    maintainers: ['seeyangzhi'],
    handler,
    description: "Perplexity Blog - Explore Perplexity's blog for articles, announcements, product updates, and tips to optimize your experience. Stay informed and make the most of Perplexity.",
    view: ViewType.Notifications,
};

async function handler() {
    const rootUrl = 'https://www.perplexity.ai/hub';
    const browser = await puppeteer();

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        // in this case, we only allow document requests to proceed
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    await page.goto(rootUrl, {
        // specify how long to wait for the page to load
        waitUntil: 'domcontentloaded',
    });

    await page.goto(rootUrl);
    // retrieve the HTML content of the page
    const response = await page.content();

    const $ = load(response);

    const items: DataItem[] = [];
    const seenLinks = new Set<string>();

    // Get featured card first
    const featuredCard = $('[data-framer-name="Featured Card Tablet"] [data-framer-name="Content"] a[href^="./hub/blog/"]').first();
    if (featuredCard.length > 0) {
        const link = new URL(String(featuredCard.attr('href')), rootUrl).href;
        const title = featuredCard.find('h4').text().trim() || featuredCard.text().trim();

        // Visit the link to get the date
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        const articleContent = await page.content();
        const $article = load(articleContent);
        const dateText = $article('[data-framer-root] > :nth-child(2) > div:nth-child(3) > div > div > div > div:nth-child(2) > div:nth-child(2)').text().trim();

        items.push({
            link,
            title,
            pubDate: dateText ? parseDate(dateText) : undefined,
        });
        seenLinks.add(link);
    }

    // Get items from "Not Featured" section
    const notFeaturedItems = $('[data-framer-name="Not Featured"] a[href^="./hub/blog/"]')
        .toArray()
        .map((item) => {
            const element = $(item);

            const link = new URL(String(element.attr('href')), rootUrl).href;

            // Extract title from h4 within the Title div
            const title = element.find('[data-framer-name="Title"] h4').text().trim();

            // Extract date from the Date div
            const dateText = element.find('[data-framer-name="Date"] p').text().trim();
            const pubDate = dateText ? parseDate(dateText) : undefined;

            return {
                link,
                title,
                pubDate,
            };
        })
        .filter((item) => {
            // Remove duplicates based on link
            if (seenLinks.has(item.link)) {
                return false;
            }
            seenLinks.add(item.link);
            return true;
        });

    items.push(...notFeaturedItems);

    page.close();
    browser.close();

    return {
        title: 'Perplexity',
        link: rootUrl,
        item: items,
        language: 'en',
    } satisfies Data;
}
