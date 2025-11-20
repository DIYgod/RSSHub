import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'yw' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.stcn.com';
    const targetUrl: string = new URL(`article/list/${id}.html`, baseUrl).href;
    const apiUrl: string = new URL(`article/category-news-rank.html`, baseUrl).href;

    const response = await ofetch(apiUrl, {
        headers: {
            'x-requested-with': 'XMLHttpRequest',
        },
        query: {
            type: id,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.data.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const linkUrl: string | undefined = item.url;

        const processedItem: DataItem = {
            title,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
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

                    const title: string = $$('div.detail-title').text();
                    const description: string = $$('div.detail-content').html() ?? '';
                    const pubDateStr: string | undefined = $$('div.detail-info span').last().text().trim();
                    const categories: string[] = $$('meta[name="keywords"]').attr('content')?.split(/,/) ?? [];
                    const authors: DataItem['author'] = $$('div.detail-info span').first().text().split(/：/).pop();
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
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.stcn-logo').attr('src'),
        author: $('meta[name="keywords"]').attr('content')?.split(/,/)[0],
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/article/rank/:id?',
    name: '热榜',
    url: 'www.stcn.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/stcn/article/rank/yw',
    parameters: {
        category: {
            description: '分类，默认为 `yw`，即要闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '要闻',
                    value: 'yw',
                },
                {
                    label: '股市',
                    value: 'gs',
                },
                {
                    label: '公司',
                    value: 'company',
                },
                {
                    label: '基金',
                    value: 'fund',
                },
                {
                    label: '金融',
                    value: 'finance',
                },
                {
                    label: '评论',
                    value: 'comment',
                },
                {
                    label: '产经',
                    value: 'cj',
                },
                {
                    label: '科创板',
                    value: 'kcb',
                },
                {
                    label: '新三板',
                    value: 'xsb',
                },
                {
                    label: 'ESG',
                    value: 'zk',
                },
                {
                    label: '滚动',
                    value: 'gd',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [要闻](https://www.stcn.com/article/list/yw.html)，网址为 \`https://www.stcn.com/article/list/yw.html\`，请截取 \`https://www.stcn.com/article/list/\` 到末尾 \`.html\` 的部分 \`yw\` 作为 \`id\` 参数填入，此时目标路由为 [\`/stcn/article/rank/yw\`](https://rsshub.app/stcn/article/rank/yw)。
:::

| 要闻 | 股市 | 公司    | 基金 | 金融    | 评论    |
| ---- | ---- | ------- | ---- | ------- | ------- |
| yw   | gs   | company | fund | finance | comment |

| 产经 | 科创板 | 新三板 | ESG | 滚动 |
| ---- | ------ | ------ | --- | ---- |
| cj   | kcb    | xsb    | zk  | gd   |
`,
    categories: ['finance'],
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
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/:id'],
            target: (params, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('type') ?? params.id;

                return `/stcn/article/rank${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '要闻',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/yw.html'],
            target: '/article/rank/yw',
        },
        {
            title: '股市',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/gs.html'],
            target: '/article/rank/gs',
        },
        {
            title: '公司',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/company.html'],
            target: '/article/rank/company',
        },
        {
            title: '基金',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/fund.html'],
            target: '/article/rank/fund',
        },
        {
            title: '金融',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/finance.html'],
            target: '/article/rank/finance',
        },
        {
            title: '评论',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/comment.html'],
            target: '/article/rank/comment',
        },
        {
            title: '产经',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/cj.html'],
            target: '/article/rank/cj',
        },
        {
            title: '科创板',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/kcb.html'],
            target: '/article/rank/kcb',
        },
        {
            title: '新三板',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/xsb.html'],
            target: '/article/rank/xsb',
        },
        {
            title: 'ESG',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/zk.html'],
            target: '/article/rank/zk',
        },
        {
            title: '滚动',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/gd.html'],
            target: '/article/rank/gd',
        },
    ],
    view: ViewType.Articles,
};
