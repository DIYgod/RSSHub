// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

async function fetch(address) {
    const res = await got(address);
    const $ = load(res.data);
    return {
        description: $('[name="_newscontent_fromname"]').html(),
        link: address,
        guid: address,
    };
}

export default async (ctx) => {
    const url = 'https://cse.csu.edu.cn/index/';
    const type = ctx.req.param('type') ?? 'tzgg';
    const link = url + type + '.htm';
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('.download li').get();
    const out = await Promise.all(
        list.map((item) => {
            const $ = load(item);
            const address = new URL($('a').attr('href'), url).href;
            const title = $('a').text();
            const pubDate = $('span').text();
            return cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                single.pubDate = parseDate(pubDate, 'YYYY/MM/DD');
                return single;
            });
        })
    );
    ctx.set('data', {
        title: $('title').text(),
        link,
        item: out,
    });
};
