import { Data, DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    url: 'htu.edu.cn',
    path: '/www/:category',
    categories: ['university'],
    parameters: {
        category: '分类数字或 ID',
    },
    name: '河南师范大学官网新闻',
    description: `河南师范大学首页列出的新闻信息，并能够获取来自本站的部分全文。
| 实例名称 | 对应分类 ID | 有无图片 |
| -------- | ----------- | -------- |
| 师大要闻 | 8954        | 有       |
| 新闻速递 | 8957        | 有       |
| 媒体师大 | 9008        | 有       |
| 通知公告 | 8955        | 无       |
| 师大故事 | 21034       | 有       |
| 影像师大 | 14555       | 有       |
| 学术论坛 | 21032       | 有       |
| 学术预告 | xsygcs      | 无       |
| 活力师大 | hlsd        | 有       |
`,
    example: '/htu/www/8954',
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
            source: ['htu.edu.cn/:category/list.htm'],
            target: '/www/:category',
        },
    ],
    maintainers: ['HackHTU'],
    handler: async (ctx) => {
        const category = ctx.req.param('category');
        const ROOT_URL = 'https://www.htu.edu.cn/';

        if (!category) {
            throw new Error('分类参数不能为空');
        }

        const link = `${ROOT_URL}${category}/list.htm`;
        const response = await ofetch(link);
        const $ = load(response);

        const lists = $('ul.news_list li.news')
            .toArray()
            .map((item) => {
                const element = $(item);

                const title = element.find('div.wz div.news_title').first().text().trim();
                const link = new URL(element.find('div.wz a').first().attr('href') ?? '', ROOT_URL).href;
                const description = element.find('div.wz div.news_text').first().text().trim();
                const pubDate = timezone(parseDate(element.find('div.wz div.news_time').first().text().trim()), +8);
                const image = new URL(element.find('div.imgs img').first().attr('src') ?? '', ROOT_URL).href;

                return {
                    title,
                    link,
                    description,
                    pubDate,
                    image,
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
            title: `河南师范大学 - ${$('title').text()}`,
            link,
            item: items,
            language: 'zh-CN',
        } as Data;
    },
};
