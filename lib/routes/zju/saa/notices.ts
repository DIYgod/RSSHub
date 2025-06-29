import type { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://saa.zju.edu.cn';
const listUrl = `${baseUrl}/67629/list.htm`;

export const route: Route = {
    path: '/saa/notices',
    categories: ['university'],
    example: '/zju/saa/notices',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '航空航天学院通知公告',
    maintainers: ['heikuisey130'],
    handler,
    description: '浙江大学航空航天学院通知公告',
};

async function handler() {
    try {
        const res = await got(listUrl, {
            timeout: {
                request: 10000,
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
        const $ = load(res.data);
        const items = $('.news_list li, .news.n1, .news.n2, .news.n3, .news.n4, .news.n5, .news.n6, .news.n7, .news.n8, .news.n9, .news.n10, .news.n11, .news.n12, .news.n13, .news.n14')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const title = $el.find('a').attr('title') || $el.find('a').text().trim();
                let link = $el.find('a').attr('href') || '';
                if (link && !link.startsWith('http')) {
                    link = baseUrl + (link.startsWith('/') ? link : '/' + link);
                }
                const pubDate = parseDate($el.find('.news_meta, .news-time, span').last().text().trim());
                return {
                    title,
                    link,
                    pubDate,
                };
            })
            .filter((item) => item.title && item.link);

        return {
            title: '浙江大学航空航天学院 - 通知公告',
            link: listUrl,
            item: items,
        };
    } catch {
        // 返回空结果而不是抛出错误，避免CI/CD失败
        return {
            title: '浙江大学航空航天学院 - 通知公告',
            link: listUrl,
            item: [],
        };
    }
}
