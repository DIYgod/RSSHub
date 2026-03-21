import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://news.hnust.edu.cn';

const categoryMap = {
    kdyw: {
        title: '综合新闻',
        path: 'kdyw',
    },
    mtkd: {
        title: '媒体报道',
        path: 'mtkd',
    },
    jxky: {
        title: '教学科研',
        path: 'jxky',
    },
    xyxw: {
        title: '校园新闻',
        path: 'xyxw',
    },
    rmxy: {
        title: '融媒校园',
        path: 'rmxy',
    },
    'xbhc/dzxb': {
        title: '电子校报',
        path: 'xbhc/dzxb',
    },
    'xbhc/dzhc': {
        title: '电子画册',
        path: 'xbhc/dzhc',
    },
} as const;

type CategoryKey = keyof typeof categoryMap;

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    const passthroughPrefixes = ['http://', 'https://', 'data:', 'mailto:', 'javascript:', '#'];

    if (passthroughPrefixes.some((prefix) => url.startsWith(prefix))) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const normalizeDescription = (html: string | null | undefined, detailUrl: string) => {
    if (!html) {
        return;
    }

    const $ = load(html);

    $('img, source').each((_, element) => {
        const item = $(element);
        const src = item.attr('src');
        const srcset = item.attr('srcset');

        if (src) {
            item.attr('src', resolveRelativeUrl(src, detailUrl));
        }

        if (srcset) {
            item.attr(
                'srcset',
                srcset
                    .split(',')
                    .map((entry) => {
                        const [url, descriptor] = entry.trim().split(/\s+/, 2);
                        const resolvedUrl = resolveRelativeUrl(url, detailUrl);

                        return descriptor ? `${resolvedUrl} ${descriptor}` : resolvedUrl;
                    })
                    .join(', ')
            );
        }
    });

    $('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, detailUrl));
        }
    });

    $('[style]').removeAttr('style');

    return $.root().html() ?? undefined;
};

const handler: Route['handler'] = async (ctx) => {
    const { category = 'kdyw' } = ctx.req.param();
    const selectedCategory = categoryMap[category as CategoryKey];

    if (!selectedCategory) {
        throw new Error(`不支持的栏目路径: ${category}。可用值包括 kdyw、mtkd、jxky、xyxw、rmxy、xbhc/dzxb、xbhc/dzhc。`);
    }

    const currentUrl = new URL(`${selectedCategory.path}/index.htm`, rootUrl).href;
    const response = await ofetch<string, 'text'>(currentUrl, {
        responseType: 'text',
    });
    const $ = load(response);

    const list = $('ul.date-list > li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const a = element.find('a').first();
            const href = a.attr('href');
            const title = a.attr('title')?.trim() || a.find('span.title').text().trim();
            const pubDateText = a.find('span.rightDate').text().trim();

            if (!href || !title) {
                return null;
            }

            return {
                title,
                link: new URL(href, currentUrl).href,
                pubDate: pubDateText ? parseDate(pubDateText) : undefined,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    const items = await Promise.all(
        list.map((item) => {
            const detailUrl = item.link;
            const detailHost = new URL(detailUrl).host;

            if (detailHost !== new URL(rootUrl).host) {
                return item;
            }

            return cache.tryGet(detailUrl, async () => {
                const detailResponse = await ofetch<string, 'text'>(detailUrl, {
                    responseType: 'text',
                });
                const detail = load(detailResponse);
                const description = normalizeDescription(detail('div.article.cont').html(), detailUrl);
                const source = detail('div.cont-tit span')
                    .toArray()
                    .map((element) => detail(element).text().replaceAll(/\s+/g, ' ').trim())
                    .find((text) => text.startsWith('来源：'));
                const pubDateText = detail('div.cont-tit span')
                    .toArray()
                    .map((element) => detail(element).text().replaceAll(/\s+/g, ' ').trim())
                    .find((text) => text.startsWith('日期：'))
                    ?.replace('日期：', '')
                    .trim();

                return {
                    ...item,
                    title: detail('div.cont-art-bt h3').text().trim() || item.title,
                    description,
                    author: source?.replace('来源：', '').trim(),
                    pubDate: pubDateText ? parseDate(pubDateText) : item.pubDate,
                };
            });
        })
    );

    return {
        title: `湖南科技大学新闻网 - ${selectedCategory.title}`,
        link: currentUrl,
        description: `湖南科技大学新闻网 ${selectedCategory.title}`,
        language: ($('html').attr('lang') ?? 'zh-CN') as Language,
        item: items as DataItem[],
    };
};

export const route: Route = {
    path: '/news/:category{.+}?',
    categories: ['university'],
    example: '/hnust/news/kdyw',
    parameters: {
        category: {
            description: '栏目路径，默认为 `kdyw`',
            default: 'kdyw',
            options: [
                {
                    label: '综合新闻',
                    value: 'kdyw',
                },
                {
                    label: '媒体报道',
                    value: 'mtkd',
                },
                {
                    label: '教学科研',
                    value: 'jxky',
                },
                {
                    label: '校园新闻',
                    value: 'xyxw',
                },
                {
                    label: '融媒校园',
                    value: 'rmxy',
                },
                {
                    label: '电子校报',
                    value: 'xbhc/dzxb',
                },
                {
                    label: '电子画册',
                    value: 'xbhc/dzhc',
                },
            ],
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
            source: ['news.hnust.edu.cn/:category/index.htm'],
            target: '/news/:category',
        },
    ],
    name: '新闻网栏目',
    maintainers: ['ZHA30'],
    handler,
    description: `| 综合新闻 | 媒体报道 | 教学科研 | 校园新闻 |
| -------- | -------- | -------- | -------- |
| kdyw     | mtkd     | jxky     | xyxw     |

| 融媒校园 | 电子校报  | 电子画册  |
| -------- | --------- | --------- |
| rmxy     | xbhc/dzxb | xbhc/dzhc |`,
};
