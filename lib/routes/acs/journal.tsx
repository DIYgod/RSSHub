import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

export const route: Route = {
    path: '/journal/:id',
    categories: ['journal'],
    example: '/acs/journal/jacsat',
    parameters: { id: 'Journal id, can be found in URL' },
    features: {
        requirePuppeteer: true,
        supportScihub: true,
    },
    radar: [
        {
            source: ['pubs.acs.org/journal/:id', 'pubs.acs.org/'],
        },
    ],
    name: 'Journal',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
See [Browse Content](https://pubs.acs.org)
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://pubs.acs.org';
    const currentUrl = `${rootUrl}/toc/${id}/0/0`;

    const { title, items } = await cache.tryGet(
        `${currentUrl}:feed`,
        async () => {
            const { page, destroy } = await getPlaywrightPage(currentUrl, {
                closeTimeout: 0,
                gotoConfig: { waitUntil: 'domcontentloaded', timeout: config.requestTimeout },
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
                },
            });
            let html: string;
            try {
                await page.waitForSelector('.toc', { timeout: config.requestTimeout });
                html = await page.content();
            } finally {
                await destroy();
            }

            const $ = load(html);

            const title = $('meta[property="og:title"]').attr('content')!;

            const items = $('.issue-item')
                .toArray()
                .map((item) => {
                    const $item = $(item);

                    const a = $item.find('.issue-item_title a');
                    const doi = $item.find('input[name="doi"]').attr('value');

                    return {
                        doi,
                        guid: doi,
                        title: a.text(),
                        link: `${rootUrl}${a.attr('href')}`,
                        pubDate: parseDate($item.find('.pub-date-value').text(), 'MMMM D, YYYY'),
                        author: $item
                            .find('.issue-item_loa li')
                            .toArray()
                            .map((a) => $(a).text())
                            .join(', '),
                        description: renderDescription($item.find('.issue-item_img').html(), $item.find('.hlFld-Abstract').html()),
                    };
                });
            return { title, items };
        },
        config.cache.routeExpire,
        false
    );

    return {
        title,
        link: currentUrl,
        item: items,
    };
}

const renderDescription = (image: string | null, description: string | null): string =>
    renderToString(
        <>
            {image ? raw(image) : null}
            {description ? raw(description) : null}
        </>
    );
