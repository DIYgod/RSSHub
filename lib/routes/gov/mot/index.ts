import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'jiaotongyaowen' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'https://www.mot.gov.cn';
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = $('div.tab-pane a')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.attr('title') ?? $el.find('span').first().text();
            const pubDateStr: string | undefined = $el.find('span.badge').text();
            const linkUrl: string | undefined = $el.attr('href');
            const upDatedStr: string | undefined = $el.find('.time').text() || pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? (linkUrl.startsWith('http') ? linkUrl : new URL(linkUrl as string, targetUrl).href) : undefined,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link || !/mot\.gov\.cn/.test(item.link) || !item.link.endsWith('.html')) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1').first().text();
                const description: string | undefined = $$('div.TRS_UEDITOR').html() ?? undefined;
                const pubDateStr: string | undefined = $$('meta[name="PubDate"]').attr('content');
                const categories: string[] = [
                    ...new Set(
                        [
                            $$('meta[name="ColumnName"]').attr('content'),
                            $$('meta[name="ColumnType"]').attr('content'),
                            $$('meta[name="ContentSource"]').attr('content'),
                            ...($$('meta[name="Keywords"]').attr('content')?.split(';') ?? []),
                        ].filter(Boolean)
                    ),
                ];
                const authors: DataItem['author'] = [$$('meta[name="ColumnSource"]').attr('content'), $$('meta[name="Author"]').attr('content')].filter(Boolean).map((author) => ({
                    name: author,
                    url: undefined,
                    avatar: undefined,
                }));
                const image: string | undefined = $$('a.navbar-brand img').attr('src') ? new URL($$('a.navbar-brand img').attr('src') as string, baseUrl).href : undefined;
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: $('title').text(),
        description: $('meta[name="ColumnDescription"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.navbar-brand img').attr('src') ? new URL($('a.navbar-brand img').attr('src') as string, baseUrl).href : undefined,
        author: $('meta[name="SiteName"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/mot/:category{.+}?',
    name: '中华人民共和国交通运输部',
    url: 'www.mot.gov.cn',
    maintainers: ['ladeng07', 'nczitzk'],
    handler,
    example: '/gov/mot/jiaotongyaowen',
    parameters: {
        category: {
            description: '分类，默认为 `jiaotongyaowen`，即交通要闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '交通要闻',
                    value: 'jiaotongyaowen',
                },
                {
                    label: '时政要闻',
                    value: 'shizhengyaowen',
                },
                {
                    label: '重要会议',
                    value: 'zhongyaohuiyi',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [重要会议](https://www.mot.gov.cn/zhongyaohuiyi/)，网址为 \`https://www.mot.gov.cn/zhongyaohuiyi/\`，请截取 \`https://www.mot.gov.cn/\` 到末尾 \`/\` 的部分 \`zhongyaohuiyi\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gov/mot/zhongyaohuiyi\`](https://rsshub.app/gov/mot/zhongyaohuiyi)。
:::`,
    categories: ['government'],
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
            source: ['www.mot.gov.cn/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/mot${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '交通要闻',
            source: ['www.mot.gov.cn/jiaotongyaowen/'],
            target: '/mot/jiaotongyaowen',
        },
        {
            title: '时政要闻',
            source: ['www.mot.gov.cn/shizhengyaowen/'],
            target: '/mot/shizhengyaowen',
        },
        {
            title: '重要会议',
            source: ['www.mot.gov.cn/zhongyaohuiyi/'],
            target: '/mot/zhongyaohuiyi',
        },
    ],
    view: ViewType.Articles,
};
