// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    // const area = ctx.req.param('area');
    const url = 'http://www.hzwgc.com/public/stop_the_water/';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('.datalist li');

    ctx.set('data', {
        title: $('title').text(),
        link: 'http://www.hzwgc.com/public/stop_the_water/',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        description: `杭州市停水通知：${item.find('.title').text()}`,
                        pubDate: new Date(item.find('.published').text()).toUTCString(),
                        link: `http://www.hzwgc.com${item.find('.btn-read').attr('href')}`,
                    };
                })
                .get(),
    });
};
