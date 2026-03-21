import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://graduate.hnust.edu.cn';

const categoryMap = {
    'yjsgzb/gzap': { title: '通知公告' },
    'yjsgzb/gzdt2': { title: '研工动态' },
    'yjsgzb/jzgz': { title: '奖助工作' },
    'pygz/jxgg': { title: '教学改革' },
    'pygz/gzdt': { title: '培养工作动态' },
    'zsgz/bszs': { title: '博士招生' },
    'zsgz/sszs': { title: '硕士招生' },
    'xwgz/xwsy': { title: '学位授予' },
    'xwgz/lwcjypy': { title: '论文抽检评议' },
    'zljk/xkpg': { title: '学科评估' },
} as const;

type CategoryKey = keyof typeof categoryMap;

const handler: Route['handler'] = async (ctx) => {
    const { category = 'yjsgzb/gzap' } = ctx.req.param();
    const selectedTitle = categoryMap[category as CategoryKey]?.title;

    if (!selectedTitle) {
        throw new Error(`不支持的栏目路径: ${category}`);
    }

    const listUrl = `${rootUrl}/${category}/index.htm`;
    const response = await ofetch(listUrl, { responseType: 'text' });
    const $ = load(response);

    const items = $('div.item ul li')
        .toArray()
        .map((el) => {
            const a = $(el).find('a');
            // href attributes on this site are unquoted; cheerio parses them correctly
            const href = a.attr('href') ?? '';
            const title = a.attr('title') ?? a.text().trim();
            const dateText = $(el).find('span').text().trim();
            const link = href ? new URL(href, listUrl).href : listUrl;

            return {
                title,
                link,
                pubDate: dateText ? parseDate(dateText) : undefined,
            };
        })
        .filter((item) => item.title && item.link !== listUrl);

    const fullItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detail = await ofetch(item.link, { responseType: 'text' });
                    const $d = load(detail);

                    const authorText = $d('div.sub-caption span')
                        .first()
                        .text()
                        .replace(/^作者[：:]/, '')
                        .trim();
                    const dateOverride = $d('div.sub-caption span')
                        .last()
                        .text()
                        .replace(/^时间[：:]/, '')
                        .trim();

                    $d('div.item.content-text [style]').removeAttr('style');
                    $d('div.item.content-text script, div.item.content-text style').remove();

                    return {
                        ...item,
                        author: authorText || undefined,
                        pubDate: dateOverride ? parseDate(dateOverride) : item.pubDate,
                        description: $d('div.item.content-text').html() ?? undefined,
                    };
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: `湖南科技大学研究生院 - ${selectedTitle}`,
        link: listUrl,
        description: `湖南科技大学研究生院 ${selectedTitle}`,
        language: 'zh-CN',
        item: fullItems,
    };
};

export const route: Route = {
    path: '/graduate/:category{.+}?',
    categories: ['university'],
    example: '/hnust/graduate/yjsgzb/gzap',
    parameters: {
        category: {
            description: '栏目路径，默认为 `yjsgzb/gzap`（通知公告）',
            default: 'yjsgzb/gzap',
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
            source: ['graduate.hnust.edu.cn/:category/index.htm'],
            target: '/graduate/:category',
        },
    ],
    name: '研究生院',
    maintainers: ['ZHA30'],
    description: `| 通知公告 | 研工动态 | 奖助工作 | 教学改革 |
| -------- | -------- | -------- | -------- |
| yjsgzb/gzap | yjsgzb/gzdt2 | yjsgzb/jzgz | pygz/jxgg |

| 博士招生 | 硕士招生 | 学位授予 | 学科评估 |
| -------- | -------- | -------- | -------- |
| zsgz/bszs | zsgz/sszs | xwgz/xwsy | zljk/xkpg |`,
    handler,
};
