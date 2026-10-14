import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import timezone from '@/utils/timezone';

import { appsUrl, createPageFetcher, fixImg, newsUrl } from '../utils';

export const route: Route = {
    path: ['/apps/:lang/post/:id', '/apps/post/:id'],
    categories: ['anime'],
    example: '/qoo-app/apps/en/post/7675',
    parameters: {
        lang: 'Language, see the table above, empty means `中文`',
        id: 'Game ID, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Game Store - Article',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const pageFetcher = createPageFetcher();
    try {
        const { id, lang = '' } = ctx.req.param();
        const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-post/${id}`;

        const response = await pageFetcher.get(link);
        const $ = load(response);

        const list = $('.qoo-post-item')
            .toArray()
            .map((item): DataItem & { postId?: string } => {
                const $item = $(item);
                const a = $item.find('a');
                return {
                    title: a.attr('title')!,
                    link: a.attr('href'),
                    // description: item.find('.img-list').html() + item.find('.text-view').html(),
                    pubDate: timezone(parseDate($item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                    author: $item.find('cite.name').text(),
                    postId: a.attr('href')!.split('/').pop(),
                };
            });

        const items = await pMap(
            list,
            (item) =>
                cache.tryGet(item.link!, async () => {
                    const { data } = await got(`${newsUrl}${lang ? `/${lang}` : ''}/wp-json/wp/v2/posts/${item.postId}`);
                    const $ = load(data.content.rendered, null, false);

                    fixImg($);

                    item.description = $.html();
                    item.pubDate = parseDateInTimezone(data.date_gmt, 0);

                    return item;
                }),
            { concurrency: 3 }
        );

        return {
            title: $('head title').text(),
            link,
            language: $('html').attr('lang') as Language,
            item: items,
        };
    } finally {
        await pageFetcher.close();
    }
}
