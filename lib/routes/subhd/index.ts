import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const defaultCategories = {
    sub: 'new',
    zu: '14',
};

export const route: Route = {
    path: '/sub/:category?',
    categories: ['multimedia'],
    example: '/subhd/sub/new',
    parameters: { category: '分类，见下表，默认为最新' },
    radar: [
        {
            source: ['subhd.tv/sub/:category', 'subhd.tv/'],
            target: '/sub/:category?',
        },
    ],
    name: '字幕',
    description: `| 最新字幕 | 热门字幕 | 剧集字幕 | 电影字幕 |
| -------- | -------- | -------- | -------- |
| new      | top      | tv       | movie    |`,
    maintainers: ['laampui', 'nczitzk'],
    handler,
};

export async function handler(ctx) {
    const type = getSubPath(ctx).split('/', 2)[1];
    const category = ctx.req.param('category') ?? defaultCategories[type];

    const rootUrl = 'https://subhd.tv';
    const currentUrl = `${rootUrl}/${type}/${category}${type === 'zu' ? '/l' : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.align-middle').each((_, el) => {
        $(el).removeClass('link-dark');
    });

    let items = $('.link-dark')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const pubDate = $item.parent().parent().find('.align-text-top').last().text();
            const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

            return {
                link: `${rootUrl}${$item.attr('href')}`,
                author: $item.parent().parent().find('.text-dark').last().text(),
                pubDate: timezone(parseDate(pubDate.includes('-') ? pubDate : `${today} ${pubDate}`), 8),
                title: `${$item.parent().parent().find('.align-middle').text()} ${$item.text().replace(/ - SubHD/, '')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.rounded-circle').remove();
                content('.view-text').last().remove();

                item.description = content('.view-text').html()! + content('.bg-white').first().html()!;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
