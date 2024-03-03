// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { appsUrl } = require('../utils');

export default async (ctx) => {
    const { id, lang = '' } = ctx.req.param();
    const link = `${appsUrl}${lang ? `/${lang}` : ''}/app-note/${id}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.qoo-note-wrap')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.content-title').text() || item.find('.description').text(),
                link: item.find('a.link-wrap').attr('href'),
                description: item.find('.description').text(),
                pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('cite.name').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('footer').remove();
                item.description = $('article .content').html();

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
