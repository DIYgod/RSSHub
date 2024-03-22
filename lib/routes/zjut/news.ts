import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'http://www.news.zjut.edu.cn';

const map = new Map([
    [1, { id: '5414/list.htm', title: '图片新闻 - 浙江工业大学' }],
    [2, { id: '5415/list.htm', title: '工大要闻 - 浙江工业大学' }],
    [3, { id: '5416/list.htm', title: '综合新闻 - 浙江工业大学' }],
    [4, { id: '5422/list.htm', title: '学术·探索 - 浙江工业大学' }],
    [5, { id: '5423/list.htm', title: '三创·人物 - 浙江工业大学' }],
    [6, { id: '5424/list.htm', title: '智库工大 - 浙江工业大学' }],
    [7, { id: '5425/list.htm', title: '美誉工大 - 浙江工业大学' }],
    [8, { id: '5419/list.htm', title: '葵园融媒 - 浙江工业大学' }],
]);

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/zjut/news/1',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '浙工大新闻',
    maintainers: ['junbaor', 'yikZero'],
    url: 'www.news.zjut.edu.cn',
    handler,
    description: `| 图片新闻 | 工大要闻 | 综合新闻 | 学术·探索 | 三创·人物 | 智库工大 | 美誉工大 | 葵园融媒 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8        |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    const id = map.get(type)?.id;
    const listResponse = await got(`${host}/${id}`, {
        responseType: 'buffer',
    });
    const $ = load(listResponse.data);

    const list = $('#l-container .news_list > li.news')
        .map((index, item) => {
            item = $(item);
            const title = item.find('a').text();
            const link = item.find('a').attr('href');

            const date = item.find("span[class='news_meta']").text();

            return {
                title,
                description: '',
                pubDate: parseDate(date),
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) => {
            if (item.link.startsWith('http')) {
                item.description = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.link}</a>`;
                return item;
            } else {
                return cache.tryGet(`${host}${item.link}`, async () => {
                    const itemsResponse = await got(`${host}${item.link}`);
                    const $ = load(itemsResponse.data);
                    item.link = `${host}${item.link}`;
                    item.description = $('div[class="wp_articlecontent"]').html();
                    return item;
                });
            }
        })
    );

    return {
        title: map.get(type)?.title,
        link: `${host}/${id}`,
        item: items,
    };
}
