// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { appsUrl, newsUrl, fixImg } = require('../utils');

export default async (ctx) => {
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

    ctx.set('data', {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    });
};
