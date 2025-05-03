import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

import { rootUrl, title, categories, convertToQueryString, getInfo, processItems } from './util';

export const route: Route = {
    path: '/:category{.+}?',
    name: '分类',
    parameters: { category: '分类，见下表，默认为最新' },
    example: '/mydrivers/bcid/801',
    maintainers: ['kt286', 'nczitzk'],
    handler,
    radar: [
        {
            source: ['m.mydrivers.com/'],
            target: '/zhibo',
        },
    ],
    description: `
#### 板块

| 电脑     | 手机     | 汽车     | 业界     | 游戏     |
| -------- | -------- | -------- | -------- | -------- |
| bcid/801 | bcid/802 | bcid/807 | bcid/803 | bcid/806 |

#### 话题

| 科学     | 排行     | 评测     | 一图     |
| -------- | -------- | -------- | -------- |
| tid/1000 | tid/1001 | tid/1002 | tid/1003 |

#### 品牌

| 安卓     | 阿里     | 微软    | 百度    | PS5       | Xbox     | 华为     |
| -------- | -------- | ------- | ------- | --------- | -------- | -------- |
| icid/121 | icid/270 | icid/90 | icid/67 | icid/6950 | icid/194 | icid/136 |

| 小米      | VIVO     | 三星     | 魅族     | 一加     | 比亚迪   | 小鹏      |
| --------- | -------- | -------- | -------- | -------- | -------- | --------- |
| icid/9355 | icid/288 | icid/154 | icid/140 | icid/385 | icid/770 | icid/7259 |

| 蔚来      | 理想       | 奔驰     | 宝马     | 大众     |
| --------- | ---------- | -------- | -------- | -------- |
| icid/7318 | icid/12947 | icid/429 | icid/461 | icid/481 |
`,
};

async function handler(ctx) {
    let { category = 'new' } = ctx.req.param();

    let newTitle = '';

    if (!/^(\w+\/\w+)$/.test(category)) {
        newTitle = `${title} - ${Object.hasOwn(categories, category) ? categories[category] : categories[Object.keys(categories)[0]]}`;
        category = `ac/${category}`;
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const queryString = convertToQueryString(category);
    const currentUrl = new URL(`newsclass.aspx${queryString}`, rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx${queryString}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    let items = $('li[data-id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.news_title').text(),
                link: new URL(item.find('div.news_title span.newst a').prop('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: item.find('a.newsimg img').prop('src'),
                }),
                author: item.find('p.tname').text(),
                guid: item.prop('data-id'),
                pubDate: timezone(parseDate(item.find('p.ttime').text()), +8),
                comments: item.find('a.tpinglun').text() ? Number.parseInt(item.find('a.tpinglun').text(), 10) : 0,
            };
        });

    items = await processItems(items);

    return {
        ...(await getInfo(currentUrl)),
        ...(newTitle ? { title: newTitle } : {}),
        item: items,
    };
}
