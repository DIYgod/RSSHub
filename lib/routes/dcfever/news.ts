// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, parseItem } = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type');

    const response = await got(`${baseUrl}/news/index.php`, {
        searchParams: {
            type: type ?? undefined,
        },
    });
    const $ = load(response.data);

    const list = $('.col-md-left .title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: new URL(item.attr('href'), response.url).href,
            };
        });

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: `${$('.channel_nav')
            .contents()
            .filter((_, e) => e.nodeType === 3)
            .text()} - ${$('head title').text()}`,
        link: response.url,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    });
};
