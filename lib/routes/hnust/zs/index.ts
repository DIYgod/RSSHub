import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://zs.hnust.edu.cn';

const categoryMap = {
    'zsxx/zsgg': { title: '招生公告' },
    'zsxx/zszc': { title: '招生章程' },
    'zsxx/zsjh': { title: '招生计划' },
    'zxzs/bszs': { title: '报送招生' },
    'zxzs/gjzxjhzs': { title: '国家专项招生' },
} as const;

type CategoryKey = keyof typeof categoryMap;

const handler: Route['handler'] = async (ctx) => {
    const { category = 'zsxx/zsgg' } = ctx.req.param();
    const selectedTitle = categoryMap[category as CategoryKey]?.title;

    if (!selectedTitle) {
        throw new Error(`不支持的栏目路径: ${category}`);
    }

    const listUrl = `${rootUrl}/${category}/index.htm`;
    const response = await ofetch(listUrl, { responseType: 'text' });
    const $ = load(response);

    const items = $('div.announcement ul li')
        .toArray()
        .map((el) => {
            const a = $(el).find('a');
            const href = a.attr('href') ?? '';
            const title = a.text().trim();
            const dateText = $(el).find('span').first().text().trim();
            const link = href ? new URL(href, listUrl).href : listUrl;
            return { title, link, pubDate: dateText ? parseDate(dateText) : undefined };
        })
        .filter((item) => item.title);

    const fullItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(rootUrl)) {
                    return item;
                }
                try {
                    const detail = await ofetch(item.link, { responseType: 'text' });
                    const $d = load(detail);
                    $d('.bdsharebuttonbox, script, style').remove();
                    $d('[style]').removeAttr('style');
                    const body = $d('div.article_con');
                    const description = body.html() ?? undefined;
                    const author = $d('div.sub-caption span').first().text().trim() || undefined;
                    const dateStr = $d('div.sub-caption span').last().text().trim();
                    return {
                        ...item,
                        description,
                        author,
                        pubDate: dateStr && !item.pubDate ? parseDate(dateStr) : item.pubDate,
                    };
                } catch {
                    // leave description empty on fetch error
                }
                return item;
            })
        )
    );

    return {
        title: `湖南科技大学招生办 - ${selectedTitle}`,
        link: listUrl,
        description: `湖南科技大学招生办 ${selectedTitle}`,
        language: 'zh-CN',
        item: fullItems,
    };
};

export const route: Route = {
    path: '/zs/:category{.+}?',
    categories: ['university'],
    example: '/hnust/zs/zsxx/zsgg',
    parameters: {
        category: {
            description: '栏目路径，默认为 `zsxx/zsgg`（招生公告）',
            default: 'zsxx/zsgg',
            options: Object.entries(categoryMap).map(([value, { title }]) => ({ label: title, value })),
        },
    },
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
            source: ['zs.hnust.edu.cn/:category/index.htm'],
            target: '/zs/:category',
        },
    ],
    name: '招生办',
    maintainers: ['ZHA30'],
    description: `| 招生公告 | 招生章程 | 招生计划 |
| -------- | -------- | -------- |
| zsxx/zsgg | zsxx/zszc | zsxx/zsjh |`,
    handler,
};
