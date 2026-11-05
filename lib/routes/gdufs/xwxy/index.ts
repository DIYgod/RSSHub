import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const baseUrl = 'https://xwxy.gdufs.edu.cn';

const pathMap = {
    news: '/xwzx/xyxw.htm',
    notices: '/xwzx/tzgg/tz.htm',
    announcements: '/xwzx/tzgg/gg.htm',
    media: '/xwzx/mtjj.htm',
};
const titleMap = {
    news: '学院新闻',
    notices: '通知',
    announcements: '公告',
    media: '媒体聚焦',
};
const linkAttributes = ['src', 'href'];
const datePattern = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/;

const handler = async (ctx) => {
    const category = ctx.req.param('category') ?? 'news';
    if (!Object.hasOwn(pathMap, category)) {
        throw new InvalidParameterError('category must be news, notices, announcements, or media.');
    }

    const link = `${baseUrl}${pathMap[category] ?? pathMap.news}`;

    const response = await got(link);
    if (!response.body) {
        throw new Error('No response body');
    }
    const $ = load(response.body);
    // Select the article links in the news list.
    const anchors = $('li[id^="line_u14_"] a');

    const items = anchors
        .toArray()
        .map((el) => {
            const a = $(el);
            const href = a.attr('href') || '';
            const li = a.closest('li');
            const contextText = (li && li.text()) || a.text();
            const dateText = a.find('i').text().trim() || (li && li.find('i').text().trim()) || (li && li.find('time').text().trim()) || (contextText.match(datePattern)?.[0] ?? '');
            const pubDate: Date | undefined = dateText ? parseDate(dateText) : undefined;
            const title = [a.find('h5').text(), a.attr('title'), a.text(), contextText.replace(datePattern, '')].find((value) => value && /\S/.test(value)) || '';
            // Skip entries without a link.
            if (!href) {
                return null;
            }
            return {
                title,
                // Resolve relative links against the current section page.
                link: href.startsWith('http') ? href : new URL(href, link).href,
                pubDate,
            };
        })
        .filter((v): v is { title: string; link: string; pubDate: Date | undefined } => !!v && !!v.title && !!v.link);

    const limit = Math.max(10, getRouteLimit(ctx, 10));
    const limitedItems = items.slice(0, limit);

    const enhancedItems = await Promise.all(
        limitedItems.map(async (item) => {
            const detail = await cache.tryGet(`${item.link}#xwxy-detail`, async () => {
                // External sites use different article templates.
                let isInternal = false;
                try {
                    const u = new URL(item.link);
                    isInternal = u.hostname === 'gdufs.edu.cn' || u.hostname.endsWith('.gdufs.edu.cn');
                } catch {
                    // ignore malformed URL
                }

                if (!isInternal) {
                    return {
                        description: '',
                        author: '',
                    };
                }

                const articleResponse = await got(item.link);
                if (!articleResponse.body) {
                    throw new Error('No article body');
                }
                const $$ = load(articleResponse.body);

                const $content = $$('.v_news_content');

                // Resolve media and article links against the article URL.
                $content.find('img, a').each((_, el) => {
                    const $el = $$(el);
                    for (const attr of linkAttributes) {
                        const v = $el.attr(attr);
                        if (v && !v.startsWith('http')) {
                            try {
                                $el.attr(attr, new URL(v, item.link).href);
                            } catch {
                                // ignore malformed url
                            }
                        }
                    }
                });

                const content = $content.html();
                // Read author and editor metadata.
                const metaTexts = $$('.show01 p i')
                    .toArray()
                    .map((el) => $$(el).text().trim())
                    .filter(Boolean);

                // Exclude publication labels and dates from the author list.
                const authors = metaTexts.filter((t) => !t.includes('发布时间')).filter((t) => !datePattern.test(t));

                // Keep the article date available as a fallback for undated list entries.
                let pubDateRecovered: string | number | Date | undefined;
                const dateTextInMeta = metaTexts.find((t) => datePattern.test(t));
                if (dateTextInMeta) {
                    const matched = dateTextInMeta.match(datePattern)?.[0];
                    if (matched) {
                        try {
                            pubDateRecovered = parseDate(matched);
                        } catch {
                            // ignore parse error
                        }
                    }
                }

                return {
                    description: content,
                    author: authors.join(', '),
                    pubDate: pubDateRecovered,
                };
            });
            return {
                ...item,
                ...detail,
                pubDate: item.pubDate ?? detail.pubDate,
            };
        })
    );

    return {
        title: `广外新传学院-${titleMap[category] ?? titleMap.news}`,
        link,
        description: '广东外语外贸大学新闻与传播学院官网-新闻中心',
        item: enhancedItems,
    };
};

export const route: Route = {
    path: '/xwxy/:category?',
    categories: ['university'],
    example: '/gdufs/xwxy/news',
    parameters: {
        category: {
            description: '分类，默认为 `news`',
            options: [
                { label: '学院新闻', value: 'news' },
                { label: '通知', value: 'notices' },
                { label: '公告', value: 'announcements' },
                { label: '媒体聚焦', value: 'media' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/xyxw.htm', 'xwxy.gdufs.edu.cn/'],
            target: '/xwxy/news',
        },
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/tzgg/tz.htm'],
            target: '/xwxy/notices',
        },
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/tzgg/gg.htm'],
            target: '/xwxy/announcements',
        },
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/mtjj.htm'],
            target: '/xwxy/media',
        },
    ],
    name: '新闻学院-新闻中心',
    maintainers: ['gz4zzxc'],
    handler,
    url: 'xwxy.gdufs.edu.cn',
};
