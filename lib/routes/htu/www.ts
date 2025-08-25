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
    maintainers: ['HTUers'],
    handler: async (ctx) => {
        const { category = '8954' } = ctx.req.param();
        const ROOT_URL = 'https://www.htu.edu.cn/';
        const HEADERS = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept-Language': 'zh-CN,zh;q=0.9',
        };
        const TIMEOUT = 10000;

        const link = `${ROOT_URL}${category}/list.htm`;
        const response = await ofetch(link, {
            headers: HEADERS,
            timeout: TIMEOUT,
        });
        const $ = load(response);

        const lists: DataItem[] = $('ul.news_list li.news')
            .toArray()
            .map((item) => {
                const element = $(item);

                const titleRaw = element.find('div.wz div.news_title').first().text().trim();
                const title = titleRaw || '';

                const href = element.find('div.wz a').first().attr('href');
                const link = href ? new URL(href, ROOT_URL).href : undefined;

                const descRaw = element.find('div.wz div.news_text').first().text().trim();
                const description = descRaw || undefined;

                const timeRaw = element.find('div.wz div.news_time').first().text().trim();
                const pubDate = timeRaw ? timezone(parseDate(timeRaw), +8) : undefined;

                const imgSrc = element.find('div.imgs img').first().attr('src');
                const image = imgSrc ? new URL(imgSrc, ROOT_URL).href : undefined;

                return {
                    title,
                    link,
                    description,
                    pubDate,
                    image,
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
