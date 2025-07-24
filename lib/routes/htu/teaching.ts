import { Data, DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    url: 'htu.edu.cn',
    path: '/teaching/:category',
    categories: ['university'],
    parameters: {
        category: '分类数字或 ID',
    },
    name: '河南师范大学教务处新闻',
    description: `河南师范大学教务处列出的新闻信息，并能够获取来自本站的部分全文。
| 名称     | 对应分类 ID |
| -------- | ----------- |
| 教学新闻 | 3257        |
| 教务通知 | 3251        |
| 公示公告 | 3258        |
| 办事指南 | 3255        |
| 下载园地 | 3254        |
| 考务管理 | kwgl        |
| 院部动态 | ybdt        |
`,
    example: '/htu/teaching/3257',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['htu.edu.cn/teaching/:category/list.htm'],
            target: '/teaching/:category',
        },
    ],
    maintainers: ['HackHTU'],
    handler: async (ctx) => {
        const category = ctx.req.param('category');
        const ROOT_URL = 'https://www.htu.edu.cn/';

        if (!category) {
            throw new Error('分类参数不能为空');
        }

        const link = `${ROOT_URL}teaching/${category}/list.htm`;
        const response = await ofetch(link);
        const $ = load(response);

        const lists = $('ul.news_list li.news')
            .toArray()
            .map((item) => {
                const element = $(item);

                const title = element.find('.news_title').first().text().trim();
                const link = new URL(element.find('.news_title a').first().attr('href') ?? '', ROOT_URL).href;
                const pubDate = timezone(parseDate(element.find('.news_meta').first().text().trim()), +8);

                return {
                    title,
                    link,
                    pubDate,
                } as DataItem;
            });

        const items = await Promise.all(
            lists.map((item) => {
                if (!item.link || item.link.includes('files')) {
                    return item;
                }
                if (new URL(item.link).origin !== new URL(ROOT_URL).origin) {
                    return item;
                }

                return cache.tryGet(item.link, async () => {
                    const respone = await ofetch(item.link!);
                    const $ = load(respone);

                    const text = $('div.read').first().text();
                    if (text) {
                        item.description = text;
                    }
                    return item;
                });
            })
        );

        return {
            title: `河南师范大学教务处 - ${$('title').text()}`,
            link,
            item: items,
            language: 'zh-CN',
        } as Data;
    },
};
