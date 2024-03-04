// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const { asyncPoolAll, parseArticle } = require('./utils');
const hostMap = {
    'en-us': 'https://www.wsj.com',
    'zh-cn': 'https://cn.wsj.com/zh-hans',
    'zh-tw': 'https://cn.wsj.com/zh-hant',
};
export default async (ctx) => {
    const lang = ctx.req.param('lang');
    const category = ctx.req.param('category') || '';
    const host = hostMap[lang];
    let subTitle = ` - ${lang.toUpperCase()}`;
    let url = host;
    if (category.length > 0) {
        url = `${host}/news/${category}`;
        subTitle = `${subTitle} - ${category}`;
    }
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const contents = $('script:contains("window.__STATE__")').text();
    const data = JSON.parse(contents.match(/{.*}/)[0]).data;
    const filteredKeys = Object.entries(data)
        .filter(([key, value]) => {
            if (!key.startsWith('article')) {
                return false;
            }
            const link = value.data.data.url;
            return link.includes('wsj.com/articles/');
        })
        .map(([key]) => key);
    const list = filteredKeys.map((key) => {
        const item = {};
        item.title = data[key].data.data.headline;
        item.link = data[key].data.data.url;
        item.test = key;
        return item;
    });
    const items = await asyncPoolAll(10, list, (item) => parseArticle(item));

    ctx.set('data', {
        title: `WSJ${subTitle}`,
        link: url,
        description: `WSJ${subTitle}`,
        item: items,
    });
};
