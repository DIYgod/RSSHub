import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = new Map([
    ['all', '全部'],
    ['anime', '动画'],
    ['book', '书籍'],
    ['music', '音乐'],
    ['game', '游戏'],
    ['real', '三次元'],
]);

const baseUrl = 'https://bangumi.tv';

type ListItem = {
    title: string;
    link: string;
    pubDate?: Date;
};

export const route: Route = {
    path: '/blog/:type?',
    categories: ['anime'],
    example: '/bangumi.tv/blog/book',
    parameters: { type: '日志分类，可选值为 `all`, `anime`, `book`, `music`, `game`, `real`，默认为 `all`' },
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
            source: ['bangumi.tv/:type/blog'],
            target: '/blog/:type',
        },
        {
            source: ['bgm.tv/:type/blog'],
            target: '/blog/:type',
        },
        {
            source: ['bangumi.tv/blog'],
            target: '/blog',
        },
        {
            source: ['bgm.tv/blog'],
            target: '/blog',
        },
    ],
    name: '日志',
    maintainers: ['ZHA30'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'all';
    if (!typeMap.has(type)) {
        throw new Error('Invalid type, use one of: all, anime, book, music, game, real');
    }

    const listUrl = type === 'all' ? `${baseUrl}/blog` : `${baseUrl}/${type}/blog`;
    const response = await ofetch(listUrl);
    const $ = load(response);

    const list: ListItem[] = $('#entry_list .item')
        .toArray()
        .flatMap((item) => {
            const element = $(item);
            const titleLink = element.find('h2 a');
            const link = titleLink.attr('href');
            if (!link) {
                return [];
            }

            const timeText = element
                .find('.tools .time')
                .text()
                .split('·')
                .map((part) => part.trim())
                .find((part) => part.startsWith('20'));

            return [
                {
                    title: titleLink.text(),
                    link: new URL(link, baseUrl).href,
                    pubDate: timeText ? timezone(parseDate(timeText), 0) : undefined,
                },
            ];
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                const detailTimeText = content('.header .time')
                    .text()
                    .split('·')
                    .map((part) => part.trim())
                    .find((part) => part.startsWith('20'));
                const detailPubDate = detailTimeText ? timezone(parseDate(detailTimeText), 0) : undefined;
                const description = content('#entry_content').html() || undefined;

                return {
                    ...item,
                    description,
                    author: content('.author.user-card .title a.avatar').first().text(),
                    category: content('.header .tags a .badge_tag')
                        .toArray()
                        .map((tag) => content(tag).text())
                        .filter(Boolean),
                    pubDate: item.pubDate ?? detailPubDate,
                };
            })
        )
    );

    return {
        title: `${typeMap.get(type)}日志 | Bangumi 番组计划`,
        link: listUrl,
        item: items,
    };
}
