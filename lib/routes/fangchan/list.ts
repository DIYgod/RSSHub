import path from 'node:path';

import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'datalist' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'http://www.fangchan.com';
    const apiBaseUrl: string = 'http://news.fangchan.com';
    const targetUrl: string = new URL(id.endsWith('/') ? id : `${id}/`, baseUrl).href;
    const apiUrl: string = new URL(`api/${id.endsWith('/') ? id.replace(/\/$/, '') : id}.json`, apiBaseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const response = await ofetch(apiUrl, {
        query: {
            pagesize: limit,
            page: 1,
        },
    });

    let items: DataItem[] = [];

    items = response.data.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string = art(path.join(__dirname, 'templates/description.art'), {
            intro: item.zhaiyao,
        });
        const pubDate: number | string = item.createtime;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = [...new Set([item.topcolumn, item.subcolumn, ...(item.keyword?.split(/,/) ?? [])].filter(Boolean))];
        const image: string | undefined = item.pic;
        const updated: number | string = item.createtime;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: linkUrl,
            id: categories,
            content: {
                html: description,
                text: item.zhaiyao ?? description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated, 'X') : undefined,
            language,
        };

        return processedItem;
    });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.summary-text h').text();
                    const description: string = (item.description ?? '') + ($$('div.top-info').html() ?? '') + ($$('div.summary-text-p').html() ?? '');
                    const pubDateStr: string | undefined = $$('span.news-date')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)?.[1];
                    const idEls: Element[] = $$('a.news-column, div.label span').toArray();
                    const categories: string[] = [...new Set([...(item.id as string[]), ...idEls.map((el) => $$(el).text()).filter(Boolean)].filter(Boolean))];
                    const authors: DataItem['author'] = $$('span.news-date')
                        .text()
                        ?.split(/\d{4}-\d{2}-\d{2}/)?.[0]
                        ?.trim()
                        ?.split(/\s/)
                        ?.map((author) => ({
                            name: author,
                        }));
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        id: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                        language,
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

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const author: string = '中房网';

    return {
        title: `${author} - ${$('div.curmbs a').text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
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
若订阅 [列表](https://www.fangchan.com/)，网址为 \`https://www.fangchan.com/\`，请截取 \`https://www.fangchan.com/\` 到末尾 \`.html\` 的部分 \`datalist\` 作为 \`id\` 参数填入，此时目标路由为 [\`/fangchan/datalist\`](https://rsshub.app/fangchan/datalist)。
:::

| [数据研究](https://www.fangchan.com/datalist)         | [行业测评](https://www.fangchan.com/industrylist)             | [政策法规](https://www.fangchan.com/policylist)           |
| ----------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| [datalist](https://rsshub.app/fangchan/list/datalist) | [industrylist](https://rsshub.app/fangchan/list/industrylist) | [policylist](https://rsshub.app/fangchan/list/policylist) |
`,
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
            source: ['www.fangchan.com/:id'],
            target: (params) => {
                const id: string = params.id;

                return `/fangchan/list/${id ? `/${id}` : ''}`;
            },
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
