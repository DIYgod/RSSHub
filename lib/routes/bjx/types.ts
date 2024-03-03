// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type');
    const response = await got({
        method: 'get',
        url: `https://guangfu.bjx.com.cn/${type}/`,
    });
    const data = response.data;
    const $ = load(data);
    const typeName = $('div.box2 em:last').text();
    const list = $('div.cc-list-content ul li');
    ctx.set('data', {
        title: `北极星太阳能光大网${typeName}`,
        description: $('meta[name="Description"]').attr('content'),
        link: `https://guangfu.bjx.com.cn/${type}/`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.html(),
                        link: item.find('a').attr('href'),
                        pubDate: parseDate(item.find('span').text()),
                    };
                })
                .get(),
    });
};
