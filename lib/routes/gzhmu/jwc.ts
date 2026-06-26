import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/gzhmu/jwc/zxxx',
    parameters: { category: '分类，默认为最新消息' },
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
            source: ['jwc.gzhmu.edu.cn/index/:category.htm'],
            target: '/jwc/:category',
        },
    ],
    name: '教务处',
    maintainers: ['AlbertWang'],
    handler,
    url: 'jwc.gzhmu.edu.cn',
    description: `| 最新消息 | 教务通知 | 学籍通知 | 实习通知 |
| -------- | -------- | -------- | -------- |
| zxxx     | jwtz     | xjtz     | sxtz     |`,
};

const categories: Record<string, { title: string; path: string }> = {
    zxxx: { title: '最新消息', path: '/index/zxxx.htm' },
    jwtz: { title: '教务通知', path: '/jwgl/jwtz.htm' },
    xjtz: { title: '学籍通知', path: '/xjkw/xjtz.htm' },
    sxtz: { title: '实习通知', path: '/sjjx/sxtz.htm' },
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'zxxx';
    const cat = categories[category] ?? categories.zxxx;
    const baseUrl = 'https://jwc.gzhmu.edu.cn';
    const link = baseUrl + cat.path;

    const response = await got({ method: 'get', url: link });
    const $ = load(response.data);

    const list = $('li[id^="line_u"]')
        .toArray()
        .map((el) => {
            const item = $(el);
            const a = item.find('h2 a');
            const title = a.attr('title') ?? a.text().trim();
            const href = a.attr('href');
            const pubDate = item.find('.time').text().trim();
            const description = item.find('p').text().trim();

            return {
                title,
                link: href ? new URL(href, link).href : link,
                pubDate: pubDate ? parseDate(pubDate, 'YYYY-MM-DD') : undefined,
                description: description || '',
            };
        })
        .filter((item) => item.title);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = new URL(item.link);
                if (url.pathname.endsWith('.jsp')) {
                    return item;
                }

                try {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = load(detailResponse.data);
                    const article = content('.v_news_content').html();
                    if (article) {
                        item.description = article;
                    }
                } catch {
                    // use the summary from list page
                }

                return item;
            })
        )
    );

    return {
        title: `广州医科大学教务处 - ${cat.title}`,
        link,
        item: items,
    };
}
