// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    // const area = ctx.req.param('area');
    const url = 'https://www.xswater.com/gongshui/channels/227.html';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('.ul-list li');

    ctx.set('data', {
        title: $('title').text(),
        link: 'https://www.xswater.com/gongshui/channels/227.html',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: `萧山区停水通知：${item.find('a').text()}`,
                        pubDate: new Date(item.find('span').text().slice(1, 11)).toUTCString(),
                        link: `https://www.xswater.com${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    });
};
