import type { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const url = 'https://news.163.com/domestic/';
const baseUrl = 'https://news.163.com';

export const route: Route = {
    path: '/news/domestic',
    categories: ['new-media'],
    example: '/163/news/domestic',
    name: '国内',
    maintainers: ['JudeThu'],
    url,
    handler: async () => {
        const response = await got(url, {
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                referer: 'https://news.163.com/',
            },
        });

        const $ = cheerio.load(response.data);

        // 先宽松抓所有新闻链接，再过滤
        const items = $('a')
            .toArray()
            .map((item) => {
                const el = $(item);
                const title = el.text().trim();
                const href = el.attr('href');

                if (!title || !href) {
                    return null;
                }

                const link = new URL(href, baseUrl).toString();

                // 只保留更像新闻详情页的链接
                if (!/\/article\//.test(link) && !/\/\d{2}\/\d{4,}/.test(link)) {
                    return null;
                }

                return {
                    title,
                    link,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .filter((item, index, self) => self.findIndex((x) => x.link === item.link) === index)
            .slice(0, 30);

        const fullItems = await Promise.all(
            items.map(async (item) => {
                try {
                    const detailResponse = await got(item.link, {
                        headers: {
                            'user-agent':
                                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
                            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                            referer: 'https://news.163.com/',
                        },
                    });

                    const content = cheerio.load(detailResponse.data);

                    const article =
                        content('.post_body').html() ||
                        content('.article-content').html() ||
                        content('.content').html() ||
                        '';

                    const pubText =
                        content('meta[property="article:published_time"]').attr('content') ||
                        content('meta[name="publishdate"]').attr('content') ||
                        '';

                    return {
                        title: item.title,
                        link: item.link,
                        description: article || item.title,
                        pubDate: pubText ? parseDate(pubText) : undefined,
                    };
                } catch {
                    return {
                        title: item.title,
                        link: item.link,
                        description: item.title,
                    };
                }
            })
        );

        return {
            title: '网易新闻 - 国内',
            link: url,
            item: fullItems,
        };
    },
};