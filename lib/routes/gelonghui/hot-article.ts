// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { parseItem } = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type') === 'week' ? 1 : 0;
    const baseUrl = `https://www.gelonghui.com`;
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('#hot-article ul')
        .eq(type)
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: `最热文章 - ${type === 0 ? '日排行' : '周排行'} - 格隆汇`,
        description: '格隆汇为中国投资者出海投资及中国公司出海融资,提供海外投资,港股开户行情,科创板股票发行数据、资讯、研究、交易等一站式服务,目前业务范围主要涉及港股与美股两大市场,未来将陆续开通台湾、日本、印度、欧洲等市场.',
        image: 'https://cdn.gelonghui.com/static/web/www.ico.la.ico',
        link: baseUrl,
        item: items,
    });
};
