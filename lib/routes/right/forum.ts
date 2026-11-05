import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/forum/:id?',
    categories: ['bbs'],
    example: '/right/forum/31',
    parameters: { id: '板块 id，可在板块页 URL 中找到，默认为新手入门及其它(硬件)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '板块',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '31';
    const limit = getRouteLimit(ctx, 20);

    const rootUrl = 'https://www.right.com.cn';
    const currentUrl = `${rootUrl}/forum/forum-${id}-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const errorMessage = copyNodes($('.alert_error'));
    errorMessage.find('script').remove();
    const sourceError = errorMessage.text().trim();
    if (sourceError) {
        throw new NotFoundError(`Forum ${id}: ${sourceError}. Choose an existing forum ID from ${rootUrl}/forum/.`);
    }

    $('a[title="隐藏置顶帖"]').each((_, el) => {
        $(el).parents('tbody').remove();
    });

    let items = $('.s')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}/forum/${$item.attr('href')}`,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`right:thread:v1:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.pstatus').remove();

                return {
                    author: content('.authi').first().text(),
                    description: content('.t_f').first().html(),
                    pubDate: timezone(parseDate(content('.authi em').first().text().replace('发表于 ', '')), 8),
                    category: content('.ptg a')
                        .toArray()
                        .map((a) => content(a).text()),
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: `${$('.xs2 a').text()} - 恩山无线论坛`,
        link: currentUrl,
        item: items,
    };
}

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
