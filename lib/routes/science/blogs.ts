import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl } from './utils';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/blogs/:name?',
    categories: ['journal'],
    example: '/science/blogs/pipeline',
    parameters: { name: 'Short name for the blog, get this from the url. Defaults to pipeline' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['science.org/blogs/:name'],
            target: '/blogs/:name',
        },
    ],
    name: 'Blogs',
    maintainers: ['TomHodson'],
    handler,
    description: `To subscribe to [IN THE PIPELINE by Derek Lowe’s](https://science.org/blogs/pipeline) or the [science editor's blog](https://science.org/blogs/editors-blog), use the name parameter \`pipeline\` or \`editors-blog\`.`,
};

async function handler(ctx) {
    const { name = 'pipeline' } = ctx.req.param();
    const link = `${baseUrl}/blogs/${name}/feed`;

    const response = await cache.tryGet(
        link,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });

            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });

            const response = await page.content();

            page.close();
            browser.close();
            return response;
        },
        config.cache.routeExpire,
        false
    );

    const $ = load(response, { xmlMode: true });
    const items = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('title').text().trim(),
                link: item.find('link').text().trim(),
                author: item
                    .find(String.raw`dc\:creator`)
                    .text()
                    .trim(),
                pubDate: parseDate(item.find('pubDate').text().trim()),
                description: item
                    .find(String.raw`content\:encoded`)
                    .text()
                    .trim(),
            };
        });

    // The RSS feed is implemented by a keyword search on the science.org end
    // so the description field of the feed looks like this:
    const name_re = /Keyword search result for Blog Series: (?<blog_name>[^-]+) --/;
    const { blog_name = 'Unknown Title' } = $('channel > description').text().match(name_re).groups;

    return {
        title: `Science Blogs: ${blog_name}`,
        description: `A Science.org blog called ${blog_name}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: `${baseUrl}/blogs/${name}`,
        language: 'en-US',
        item: items,
    };
}
