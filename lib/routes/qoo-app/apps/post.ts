import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { appsUrl, fixImg, newsUrl } from '../utils';

export const route: Route = {
    path: '/apps/:lang?/post/:id',
    categories: ['anime'],
    example: '/qoo-app/apps/en/post/7675',
    parameters: { lang: 'Language, see the table above, empty means `中文`', id: 'Game ID, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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
    const { id, lang = '' } = ctx.req.param();
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-post/${id}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.qoo-post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: a.attr('href'),
                // description: item.find('.img-list').html() + item.find('.text-view').html(),
                pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('cite.name').text(),
                postId: a.attr('href').split('/').pop(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${newsUrl}${lang ? `/${lang}` : ''}/wp-json/wp/v2/posts/${item.postId}`);
                const $ = load(data.content.rendered, null, false);

                fixImg($);

                item.description = $.html();
                item.pubDate = parseDate(data.date_gmt);

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
}
