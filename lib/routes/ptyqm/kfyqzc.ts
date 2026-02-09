import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.ptyqm.com';
const listUrl = `${baseUrl}/category/kfyqzc/`;
type ListItem = {
    title: string;
    link: string;
    pubDate: Date | undefined;
    category: string[];
};

export const route: Route = {
    path: '/kfyqzc',
    categories: ['blog'],
    example: '/ptyqm/kfyqzc',
    radar: [
        {
            source: ['www.ptyqm.com/category/kfyqzc/'],
            target: '/kfyqzc',
        },
    ],
    name: '开放注册',
    maintainers: ['onlyMyKazari'],
    handler,
    description: 'PT邀请网开放注册栏目，提供 PT 站点开注信息。',
};

async function handler(ctx) {
    const { data } = await got(listUrl);
    const $ = load(data);

    const list = $('#main article[id^="post-"]')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20)
        .toArray()
        .map((item) => {
            const article = $(item);
            const link = article.find('h2.entry-title a').attr('href');

            return {
                title: article.find('h2.entry-title a').text(),
                link,
                pubDate: parseDate(article.find('time').first().attr('datetime')),
                category: article
                    .find('.post-tag a')
                    .toArray()
                    .map((tag) => $(tag).text().trim())
                    .filter(Boolean),
            };
        })
        .filter((item): item is ListItem => Boolean(item.link));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detail } = await got(item.link);
                const $ = load(detail);

                const content = $('.entry-content').first().clone();
                content.find('.entry-meta, .single-cat-tag, .single-tag, .entry-more').remove();
                content.find('img').each((_, element) => {
                    const node = $(element);
                    const src = node.attr('src');
                    const dataSrc = node.attr('data-src') ?? node.attr('data-original');
                    if (src?.startsWith('data:image') && dataSrc) {
                        node.attr('src', dataSrc);
                    }
                });

                const category = [
                    ...new Set([
                        ...(item.category ?? []),
                        ...$('.single-cat-tag a, .single-tag a')
                            .toArray()
                            .map((tag) => $(tag).text().trim())
                            .filter(Boolean),
                    ]),
                ];

                item.description = content.html();
                item.category = category;

                return item;
            })
        )
    );

    return {
        title: 'PT邀请码网 - 开放注册',
        link: listUrl,
        item: items,
    };
}
