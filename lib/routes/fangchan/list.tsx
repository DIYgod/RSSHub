import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'datalist' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'http://www.fangchan.com';
    const apiBaseUrl = 'http://news.fangchan.com';
    const targetUrl: string = new URL(id.endsWith('/') ? id : `${id}/`, baseUrl).href;
    const apiUrl: string = new URL(`api/${id.endsWith('/') ? id.replace(/\/$/, '') : id}.json`, apiBaseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    const response = await ofetch(apiUrl, {
        query: {
            pagesize: Math.max(30, limit),
            page: 1,
        },
    });

    let items: DataItem[] = response.data.slice(0, Math.max(30, limit)).map((item): DataItem => {
        const title: string = item.title;
        const description: string = renderToString(item.zhaiyao ? <blockquote>{item.zhaiyao}</blockquote> : null);
        const pubDate: number | string = item.createtime;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = [...new Set([item.topcolumn, item.subcolumn, ...(item.keyword?.split(/,/) ?? [])].filter(Boolean))];
        const image: string | undefined = item.pic;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: linkUrl,
            category: categories,
            content: {
                html: description,
                text: item.zhaiyao ?? description,
            },
            image,
            banner: image,
            language,
        };

        return processedItem;
    });

    const sorted = ctx.req.query('sorted') !== 'false';
    const allDated = items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()));
    if (sorted && allDated) {
        items = items.toSorted((a, b) => +new Date(b.pubDate!) - +new Date(a.pubDate!));
    }
    if (!sorted || allDated) {
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const detail = await cache.tryGet(`fangchan:article:${item.link}`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.summary-text h').text();
                const description: string = $$('div.summary-text-p').html() ?? '';
                const pubDateStr: string | undefined = $$('span.news-date')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)?.[0];
                const idEls: Element[] = $$('a.news-column, div.label span').toArray();
                const categories: string[] = [...new Set(idEls.map((el) => $$(el).text()).filter(Boolean))];
                const authors: DataItem['author'] = $$('span.news-date')
                    .text()
                    ?.split(/\d{4}-\d{2}-\d{2}/, 1)?.[0]
                    ?.trim()
                    ?.split(/\s/)
                    ?.filter(Boolean)
                    ?.map((author) => ({
                        name: author,
                    }));

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : undefined,
                    category: categories,
                    author: authors?.length ? authors : undefined,
                    content: {
                        html: description,
                        text: $$('div.summary-text-p').text(),
                    },
                };

                const extraLinkEls: Element[] = $$('ul.xgxw-ul li a').toArray();
                const extraLinks = extraLinkEls
                    .map((extraLinkEl) => {
                        const $$extraLinkEl: Cheerio<Element> = $$(extraLinkEl);

                        return {
                            url: $$extraLinkEl.attr('href'),
                            type: 'related',
                            content_html: $$extraLinkEl.text(),
                        };
                    })
                    .filter((_): _ is { url: string; type: string; content_html: string } => true);

                if (extraLinks) {
                    processedItem = {
                        ...processedItem,
                        _extra: {
                            links: extraLinks,
                        },
                    };
                }

                return processedItem;
            });
            const description = (item.description ?? '') + (detail.description ?? '');
            return {
                ...item,
                ...detail,
                description,
                pubDate: detail.pubDate ?? item.pubDate,
                category: [...new Set([...((item.category as string[]) ?? []), ...((detail.category as string[]) ?? [])])],
                content: {
                    html: description,
                    text: (item.content?.text ?? '') + (detail.content?.text ?? ''),
                },
                language,
            };
        },
        { concurrency: 3 }
    );

    const author = '中房网';

    return {
        title: `${author} - ${$('div.curmbs a').text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        author,
        language,
    };
};

export const route: Route = {
    path: '/list/:id?',
    name: '列表',
    url: 'www.fangchan.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/fangchan/list/datalist',
    parameters: {
        id: {
            description: '分类，默认为 `datalist`，即数据研究，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '数据研究',
                    value: 'datalist',
                },
                {
                    label: '行业测评',
                    value: 'industrylist',
                },
                {
                    label: '政策法规',
                    value: 'policylist',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [数据研究](http://www.fangchan.com/datalist/)，可将分类页 URL 中的 \`datalist\` 填入 \`id\` 参数，对应路由为 [\`/fangchan/list/datalist\`](https://rsshub.app/fangchan/list/datalist)。
:::

| [数据研究](http://www.fangchan.com/datalist/)         | [行业测评](http://www.fangchan.com/industrylist/)             | [政策法规](http://www.fangchan.com/policylist/)           |
| ----------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| [datalist](https://rsshub.app/fangchan/list/datalist) | [industrylist](https://rsshub.app/fangchan/list/industrylist) | [policylist](https://rsshub.app/fangchan/list/policylist) |`,
    categories: ['new-media'],
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
            source: ['www.fangchan.com/'],
            target: '/list',
        },
        {
            title: '数据研究',
            source: ['www.fangchan.com/datalist'],
            target: '/list/datalist',
        },
        {
            title: '行业测评',
            source: ['www.fangchan.com/industrylist'],
            target: '/list/industrylist',
        },
        {
            title: '政策法规',
            source: ['www.fangchan.com/policylist'],
            target: '/list/policylist',
        },
    ],
    view: ViewType.Articles,
};
