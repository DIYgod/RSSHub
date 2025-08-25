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
        const { category = '3257' } = ctx.req.param();
        const ROOT_URL = 'https://www.htu.edu.cn/';
        const HEADERS = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept-Language': 'zh-CN,zh;q=0.9',
        };
        const TIMEOUT = 10000;

        const link = `${ROOT_URL}teaching/${category}/list.htm`;
        const response = await ofetch(link, {
            headers: HEADERS,
            timeout: TIMEOUT,
        });
        const $ = load(response);

        const lists: DataItem[] = $('ul.news_list li.news')
            .toArray()
            .map((item) => {
                const element = $(item);

                const titleRaw = element.find('.news_title').first().text().trim();
                const title = titleRaw || '';

                const href = element.find('.news_title a').first().attr('href');
                const link = href ? new URL(href, ROOT_URL).href : undefined;

                const timeRaw = element.find('.news_meta').first().text().trim();
                const pubDate = timeRaw ? timezone(parseDate(timeRaw), +8) : undefined;

                return {
                    title,
                    link,
                    pubDate,
                };
            });

        const items: DataItem[] = await Promise.all(
            lists.map((item) => {
                const link = item.link;

                // Filter out items without a link or those that link to files
                if (!link || link.includes('files')) {
                    return item;
                }

                // Ensure the link is from the same origin, filter out external links
                if (new URL(link).origin !== new URL(ROOT_URL).origin) {
                    return item;
                }

                return cache.tryGet(link, async () => {
                    try {
                        const respone = await ofetch(link, { timeout: TIMEOUT });
                        const $ = load(respone);

                        const text = $('div.read').first().text();
                        if (text) {
                            item.description = text;
                        }

                        // Try to get image from the article content if not already present
                        if (!item.image) {
                            const img = $('div.read img').first().attr('src');
                            if (img) {
                                item.image = new URL(img, ROOT_URL).href;
                            }
                        }
                        return item;
                    } catch {
                        return item;
                    }
                });
            })
        );

        const data: Data = {
            title: `河南师范大学 - ${$('title').text()}`,
            link,
            item: items,
            language: 'zh-CN',
        };

        return data;
    },
};
