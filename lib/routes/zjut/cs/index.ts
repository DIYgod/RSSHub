import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://cs.zjut.edu.cn/jsp/newsclass.jsp?wcId=';
const host = 'cs.zjut.edu.cn';

export const route: Route = {
    path: '/cs/:type',
    categories: ['university'],
    example: '/zjut/cs/54',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与技术学院、软件学院',
    maintainers: ['zhullyb'],
    url: 'cs.zjut.edu.cn',
    handler,
    description: `| 新闻资讯 | 学术动态 | 通知公告 |
| -------- | -------- | -------- |
| 54       | 55       | 53       |`,
};

async function handler(ctx): Promise<Data> {
    const type = Number.parseInt(ctx.req.param('type'));
    const response = await ofetch(rootUrl + type);
    const $ = load(response);

    const list = $('dl.news')
        .toArray()
        .map((item) => {
            const cheerioItem = $(item);
            const a = cheerioItem.find('a');

            try {
                const title = a.text();
                let link = a.attr('href');
                if (!link) {
                    link = '';
                } else if (!link.startsWith('http')) {
                    link = 'https://' + host + '/jsp/' + link;
                }
                const dateText = cheerioItem.find('.datetime').text().slice(1, -1);
                const date = dateText.trim() ? parseDate(dateText) : undefined;
                const pubDate = date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined;

                return {
                    title,
                    link,
                    pubDate,
                };
            } catch {
                return {
                    title: '',
                    link: '',
                };
            }
        })
        .filter((item) => item.title && item.link);

    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`zjut:cs:details:${item.link}`, async () => {
                const newItem = {
                    description: '',
                };
                if (host === new URL(item.link).hostname) {
                    if (new URL(item.link).pathname.startsWith('/upload')) {
                        // 链接为一个文件，直接返回链接
                        newItem.description = item.link;
                    } else {
                        const response = await ofetch(item.link);
                        const $ = load(response);
                        newItem.description = $('div.news1content').html() ?? '';
                    }
                } else {
                    // 涉及到其他站点，不方便做统一的 html 解析，直接返回链接
                    newItem.description = item.link;
                }
                return newItem.description;
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('li#classname').text() + ' - 浙江工业大学计算机科学与技术学院、软件学院',
        link: rootUrl + type,
        item: items,
    };
}
