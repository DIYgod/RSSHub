import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import * as url from 'node:url';

const host = 'https://www.douban.com/explore/column/';
export const route: Route = {
    path: '/explore/column/:id',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = url.resolve(host, id);
    const response = await got.get(link);
    const $ = load(response.data);
    const title = $('div.h1').text();

    const list = $('div.item')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const info = {
                title: $(item).find('div.title a').text(),
                link: $(item).find('div.title a').attr('href'),
                author: $(item).find('div.usr-pic a').text(),
            };
            return info;
        });

    for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].author === '[已注销]') {
            list.splice(i, 1);
        }
    }

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const author = info.author;
            const itemUrl = info.link;

            const response = await got.get(itemUrl);
            const $ = load(response.data);
            const description = $('#link-report').html();

            const single = {
                title,
                link: itemUrl,
                description,
                author,
            };
            return single;
        })
    );

    return {
        title: `${title}-豆瓣发现`,
        link,
        item: out,
    };
}
