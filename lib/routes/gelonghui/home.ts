// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { parseItem } = require('./utils');

export default async (ctx) => {
    const { tag = 'web_home_page' } = ctx.req.param();
    const apiUrl = `https://www.gelonghui.com/api/channels/${tag}/articles/v8`;
    const { data } = await got(apiUrl);

    const list = data.result.map((article) => {
        article = article.data;
        return {
            title: article.title,
            description: article.summary,
            link: article.link,
            author: article.nick,
            category: article.source,
            pubDate: parseDate(article.timestamp, 'X'),
        };
    });

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: '格隆汇-财经资讯动态-股市行情',
        description: '格隆汇为中国投资者出海投资及中国公司出海融资,提供海外投资,港股开户行情,科创板股票发行数据、资讯、研究、交易等一站式服务,目前业务范围主要涉及港股与美股两大市场,未来将陆续开通台湾、日本、印度、欧洲等市场.',
        image: 'https://cdn.gelonghui.com/static/web/www.ico.la.ico',
        link: 'https://www.gelonghui.com',
        item: items,
    });
};
