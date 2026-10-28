import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import logger from '@/utils/logger';
import playwright from '@/utils/playwright';

const domain = 'www.colamanga.com';

export const route: Route = {
    path: '/:id',
    parameters: { id: '漫画id' },
    name: 'Manga',
    maintainers: ['machsix'],
    example: '/colamanga/manga-qq978758',
    categories: ['anime'],
    radar: [
        {
            source: [`${domain}/:id/`],
            target: '/:id',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

async function handler(ctx: Context) {
    const id = ctx.req.param('id');
    const url = `https://${domain}/${id}`;

    const context = await playwright();

    let response: string;
    try {
        const page = await context.newPage();

        await page.route('**/*', (route) => {
            const request = route.request();
            request.resourceType() === 'document' ? route.continue() : route.abort();
        });

        logger.http(`Requesting ${url}`);
        await page.goto(url, {
            // Wait for the document to load.
            waitUntil: 'domcontentloaded',
        });

        response = await page.content();
    } finally {
        await context.close();
    }

    const $ = load(response);

    const bookName = $("meta[property='og:comic:book_name']").attr('content');

    const author = $("span:contains('作者')").parent().contents().eq(1).text();
    // const cover = $(".fed-deta-images a").attr('data-original');
    const items = $('.all_data_list >ul>li>a')
        .toArray()
        .map((elem) => ({
            title: `${bookName} ${$(elem).text()}`,
            link: elem.attribs.href,
            description: $('.fed-part-esan').text(),
            author,
        }));

    return {
        title: bookName || 'Unknown Manga',
        link: url,
        item: items,
    };
}
