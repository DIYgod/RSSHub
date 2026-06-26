import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xxgk/:category?',
    categories: ['university'],
    example: '/gzhmu/xxgk/xxgkdt',
    parameters: { category: '分类，默认为信息公开动态' },
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
            source: ['xxgk.gzhmu.edu.cn/:category.htm'],
            target: '/xxgk/:category',
        },
    ],
    name: '信息公开网',
    maintainers: ['AlbertWang'],
    handler,
    url: 'xxgk.gzhmu.edu.cn',
    description: `| 信息公开动态 | 信息公开指南 | 信息公开制度 | 信息公开年报 | 信息公开专栏 |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| xxgkdt       | xxgkzn       | xxgkzd       | xxgknb       | xxgkzl       |`,
};

const categories: Record<string, { title: string; path: string }> = {
    xxgkdt: { title: '信息公开动态', path: '/xxgkdt.htm' },
    xxgkzn: { title: '信息公开指南', path: '/xxgkzn.htm' },
    xxgkzd: { title: '信息公开制度', path: '/xxgkzd.htm' },
    xxgknb: { title: '信息公开年报', path: '/xxgknb.htm' },
    xxgkzl: { title: '信息公开专栏', path: '/xxgkzl.htm' },
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'xxgkdt';
    const cat = categories[category] ?? categories.xxgkdt;
    const baseUrl = 'https://xxgk.gzhmu.edu.cn';
    const link = baseUrl + '/' + cat.path;

    const response = await got({ method: 'get', url: link });
    const $ = load(response.data);

    const list = $('dd[id^="line_u"],DD[id^="line_u"]')
        .toArray()
        .map((el) => {
            const item = $(el);
            const a = item.find('a');
            const title = a.attr('title') ?? a.text().trim();
            const href = a.attr('href');
            const pubDate = item.find('span').text().trim();

            return {
                title,
                link: href ? new URL(href, link).href : link,
                pubDate: pubDate ? parseDate(pubDate, 'YYYY-MM-DD') : undefined,
                description: '',
            };
        })
        .filter((item) => item.title);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = load(detailResponse.data);
                    const article = content('.v_news_content').html();
                    if (article) {
                        item.description = article;
                    }
                } catch {
                    // use empty description from list page
                }
                return item;
            })
        )
    );

    return {
        title: `广州医科大学信息公开 - ${cat.title}`,
        link,
        item: items,
    };
}
