import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

const orders = {
    newest: { path: 'poems', title: 'Newest' },
    famous: { path: 'famous', title: 'Famous' },
    picks: { path: '', title: 'Picks' },
};

export const route: Route = {
    path: '/:order?',
    categories: ['reading'],
    example: '/allpoetry/newest',
    parameters: { order: 'Ordering, `newest`, `famous` or `picks`, `newest` by default' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: 'Poems',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx: Context) {
    const { order = 'newest' } = ctx.req.param();
    const { path, title } = orders[order] ?? orders.newest;
    const host = 'https://allpoetry.com/';
    const link = host + path;

    const { page, destroy } = await getPlaywrightPage(link);
    await page.waitForSelector('#items-list .itm h1 a');
    const html = await page.content();
    await destroy();

    const $ = load(html);

    const items = $('#items-list .itm')
        .toArray()
        .map((e) => {
            const $e = $(e);
            const $title = $e.find('h1 a');
            if (!$title.length) {
                return null;
            }
            const itemUrl = new URL($title.attr('href')!, host).href;
            const $description = $e.find('[data-preview-target="content"]');
            $description.find('svg').remove();

            return {
                title: $title.text(),
                description: $description.html(),
                link: itemUrl,
                author: $e.find('.item_username a').text(),
                guid: itemUrl,
            };
        })
        .filter((item) => item !== null);

    return {
        title: `All Poetry - ${title}`,
        link,
        item: items,
    };
}
