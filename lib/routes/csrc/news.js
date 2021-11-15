import cheerio from 'cheerio';
import got from '~/utils/got.js';
import {resolve} from 'url';

export default async (ctx) => {
    let {
        suffix = 'zjhxwfb-xwdd'
    } = ctx.params;
    suffix = suffix.replace('-', '/');
    const url = resolve('http://www.csrc.gov.cn/pub/newsite/', suffix + '/');
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const title = $('div.title .bt').text();
    const list = $('.fl_list li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('span').text();
            const title = $('a').text();
            const sub_url = $('a').attr('href');
            const itemUrl = resolve(url, sub_url);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
                description: $d('.content .Custom_UnionStyle').html() || $d('.contentss').html() || $d('.Section0').html(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: `中国证券监督管理委员会-${title}`,
        link: url,
        item: out,
    };
};
