import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://cgzx.hnust.edu.cn';

const categoryMap = {
    'cgxx/cggg': { title: '采购公告' },
    'cgxx/cgyg': { title: '采购意向' },
    'cgxx/cjgg': { title: '结果公告' },
    'cgxx/qtgg': { title: '其他公告' },
    'xwgg/tzgg': { title: '新闻通知' },
} as const;

type CategoryKey = keyof typeof categoryMap;

const handler: Route['handler'] = async (ctx) => {
    const { category = 'cgxx/cggg' } = ctx.req.param();
    const selectedTitle = categoryMap[category as CategoryKey]?.title;

    if (!selectedTitle) {
        throw new Error(`不支持的栏目路径: ${category}`);
    }

    const listUrl = `${rootUrl}/${category}/index.htm`;
    const response = await ofetch(listUrl, { responseType: 'text' });
    const $ = load(response);

    const items = $('div.t2-subCon ul li')
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
                    $d('.article-share').remove();
                    $d('script, style').remove();
                    $d('[style]').removeAttr('style');
                    const body = $d('div.t2-subCon body');
                    return { ...item, description: (body.length ? body : $d('div.t2-subCon')).html() ?? undefined };
                } catch {
                    // leave description empty on fetch error
                }
                return item;
            })
        )
    );

    return {
        title: `湖南科技大学采购中心 - ${selectedTitle}`,
        link: listUrl,
        description: `湖南科技大学采购中心 ${selectedTitle}`,
        language: 'zh-CN',
        item: fullItems,
    };
};

export const route: Route = {
    path: '/cgzx/:category{.+}?',
    categories: ['university'],
    example: '/hnust/cgzx/cgxx/cggg',
    parameters: {
        category: {
            description: '栏目路径，默认为 `cgxx/cggg`（采购公告）',
            default: 'cgxx/cggg',
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
            source: ['cgzx.hnust.edu.cn/:category/index.htm'],
            target: '/cgzx/:category',
        },
    ],
    name: '采购与招投标管理中心',
    maintainers: ['ZHA30'],
    description: `| 采购公告 | 采购意向 | 结果公告 | 其他公告 |
| -------- | -------- | -------- | -------- |
| cgxx/cggg | cgxx/cgyg | cgxx/cjgg | cgxx/qtgg |`,
    handler,
};
