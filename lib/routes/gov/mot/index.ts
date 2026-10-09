import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'xinwen/jiaotongyaowen' } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '30');

    const baseUrl = 'https://www.mot.gov.cn';
    const image = `${baseUrl}/images/logo.png`;
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh') as Language;

    let items: DataItem[] = $('li.news-item a.news-link')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('.news-title').text().trim();
            const pubDateStr: string | undefined = $el.find('.news-date').text();
            const linkUrl: string | undefined = $el.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? (linkUrl.startsWith('http') ? linkUrl : new URL(linkUrl, targetUrl).href) : undefined,
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
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1').first().text();
                const description = $$('div.TRS_UEDITOR').html();
                const pubDateStr: string | undefined = $$('meta[name="PubDate"]').attr('content');
                const categories: string[] = [
                    ...new Set(
                        [
                            $$('meta[name="ColumnName"]').attr('content'),
                            $$('meta[name="ColumnType"]').attr('content'),
                            $$('meta[name="ContentSource"]').attr('content'),
                            ...($$('meta[name="Keywords"]').attr('content')?.split(';') ?? []),
                        ].filter((content): content is string => Boolean(content))
                    ),
                ];
                const authors: DataItem['author'] = [$$('meta[name="ColumnSource"]').attr('content'), $$('meta[name="Author"]').attr('content')].filter(Boolean).map((author) => ({
                    name: author!,
                    url: undefined,
                    avatar: undefined,
                }));
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
        image,
        author: $('meta[name="SiteName"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '通用',
    url: 'www.mot.gov.cn',
    maintainers: ['ladeng07', 'nczitzk'],
    handler,
    example: '/gov/mot/xinwen/jiaotongyaowen',
    parameters: {
        category: {
            description: '分类，默认为 `xinwen/jiaotongyaowen`，即交通要闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '交通要闻',
                    value: 'xinwen/jiaotongyaowen',
                },
                {
                    label: '时政要闻',
                    value: 'xinwen/shizhengyaowen',
                },
                {
                    label: '政策解读',
                    value: 'gongkai/zcjd',
                },
                {
                    label: '预警提示',
                    value: 'fuwu/yujingtishi',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [政策解读](https://www.mot.gov.cn/gongkai/zcjd/)，网址为 \`https://www.mot.gov.cn/gongkai/zcjd/\`，请截取 \`https://www.mot.gov.cn/\` 到末尾 \`/\` 的部分 \`gongkai/zcjd\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gov/mot/gongkai/zcjd\`](https://rsshub.app/gov/mot/gongkai/zcjd)。
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
            title: '交通要闻',
            source: ['www.mot.gov.cn/xinwen/jiaotongyaowen/'],
            target: '/xinwen/jiaotongyaowen',
        },
        {
            title: '时政要闻',
            source: ['www.mot.gov.cn/xinwen/shizhengyaowen/'],
            target: '/xinwen/shizhengyaowen',
        },
        {
            title: '政策解读',
            source: ['www.mot.gov.cn/gongkai/zcjd/'],
            target: '/gongkai/zcjd',
        },
        {
            title: '预警提示',
            source: ['www.mot.gov.cn/fuwu/yujingtishi/'],
            target: '/fuwu/yujingtishi',
        },
    ],
    view: ViewType.Articles,
};
