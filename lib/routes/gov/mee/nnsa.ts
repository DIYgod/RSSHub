import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'ywdt/hjyw' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://nnsa.mee.gov.cn';
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('a.cjcx_biaob, ul#div li a')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.text();
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                link: linkUrl ? (linkUrl.startsWith('http') ? linkUrl : new URL(linkUrl as string, baseUrl).href) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('meta[name="ArticleTitle"]').attr('content') ?? item.title;
                const description: string | undefined = $$('div.Custom_UnionStyle').html() ?? undefined;
                const pubDateStr: string | undefined = $$('meta[name="PubDate"]').attr('content');
                const categoryEls: Cheerio<Element>[] = [$$('meta[name="ColumnName"]'), $$('meta[name="ColumnType"]'), $$('meta[name="ContentSource"]'), $$('meta[name="source"]')];
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el)?.attr('content') ?? '').filter(Boolean))];
                const authors: DataItem['author'] = [$$('meta[name="Author"]'), $$('meta[name="author"]'), $$('meta[name="source"]')]
                    .filter((authorEl) => $$(authorEl).attr('content'))
                    .map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.attr('content') ?? '',
                        };
                    });
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
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
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.logo img').attr('src') ? new URL($('a.logo img').attr('src') as string, baseUrl).href : undefined,
        author: $('meta[name="SiteName"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/mee/nnsa/:category{.+}?',
    name: '国家核安全局',
    url: 'nnsa.mee.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/mee/nnsa/ywdt/hjyw',
    parameters: {
        category: {
            description: '分类，默认为 `ywdt/hjyw`，即环境要闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '环境要闻',
                    value: 'ywdt/hjyw',
                },
            ],
        },
    },
    description: `:::tip
订阅 [环境要闻](https://nnsa.mee.gov.cn/ywdt/hjyw/)，其源网址为 \`https://nnsa.mee.gov.cn/ywdt/hjyw/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/gov/mee/nnsa/ywdt/hjyw\`](https://rsshub.app/gov/mee/nnsa/ywdt/hjyw)。
:::
`,
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
            source: ['nnsa.mee.gov.cn/:category'],
            target: '/mee/nnsa/:category',
        },
    ],
    view: ViewType.Articles,
};
