import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'yw' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'https://www.stcn.com';
    const targetUrl: string = new URL(`article/list/${id}.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    let items: DataItem[] = $('ul.infinite-list li')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const $aEl: Cheerio<Element> = $el.find('div.tt a');

            const title: string = $aEl.text();
            const description: string = $el.find('div.text').html() ?? '';
            const pubDateStr: string | undefined = $el
                .find('div.info span')
                .filter((_, el) => /^(?:\d{4}-)?\d{2}-\d{2} \d{2}:\d{2}$|^\d{2}:\d{2}$/.test($(el).text()))
                .last()
                .text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('div.tags span').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authors: DataItem['author'] = $el.find('div.info span').first().text();
            const image: string | undefined = $el.find('div.side a img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr, ['YYYY-MM-DD HH:mm', 'MM-DD HH:mm', 'HH:mm']), 8) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? timezone(parseDate(upDatedStr, ['YYYY-MM-DD HH:mm', 'MM-DD HH:mm', 'HH:mm']), 8) : undefined,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const detail = await cache.tryGet(`stcn:list:detail:v5:${item.link}`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.detail-title').text();
                const description = $$('div.detail-content').html();
                const pubDateStr: string | undefined = $$('div.detail-info')
                    .children('span')
                    .filter((_, el) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/.test($$(el).text()))
                    .last()
                    .text();
                const categories: string[] = $$('meta[name="keywords"]').attr('content')?.split(/,/) ?? [];
                const authors: DataItem['author'] =
                    $$('div.detail-info')
                        .children('span')
                        .filter((_, el) => $$(el).text().startsWith('作者：'))
                        .first()
                        .text()
                        .replace(/^作者：/, '') || $$('div.detail-info span').first().text().split(/：/).pop();
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : undefined,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: $$('div.detail-content').text(),
                    },
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : undefined,
                };

                return processedItem;
            });
            return {
                ...item,
                ...detail,
                pubDate: detail.pubDate ?? item.pubDate,
                updated: detail.updated ?? item.updated,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('img.stcn-logo').attr('src'),
        author: $('meta[name="keywords"]').attr('content')?.split(/,/, 1)[0],
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/article/list/:id?',
    name: '列表',
    url: 'www.stcn.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/stcn/article/list/yw',
    parameters: {
        id: {
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
若订阅 [要闻](https://www.stcn.com/article/list/yw.html)，网址为 \`https://www.stcn.com/article/list/yw.html\`，请截取 \`https://www.stcn.com/article/list/\` 到末尾 \`.html\` 的部分 \`yw\` 作为 \`id\` 参数填入，此时目标路由为 [\`/stcn/article/list/yw\`](https://rsshub.app/stcn/article/list/yw)。
:::

| 要闻 | 股市 | 公司    | 基金 | 金融    | 评论    |
| ---- | ---- | ------- | ---- | ------- | ------- |
| yw   | gs   | company | fund | finance | comment |

| 产经 | 科创板 | 新三板 | ESG | 滚动 |
| ---- | ------ | ------ | --- | ---- |
| cj   | kcb    | xsb    | zk  | gd   |`,
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
            title: '要闻',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/yw.html'],
            target: '/article/list/yw',
        },
        {
            title: '股市',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/gs.html'],
            target: '/article/list/gs',
        },
        {
            title: '公司',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/company.html'],
            target: '/article/list/company',
        },
        {
            title: '基金',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/fund.html'],
            target: '/article/list/fund',
        },
        {
            title: '金融',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/finance.html'],
            target: '/article/list/finance',
        },
        {
            title: '评论',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/comment.html'],
            target: '/article/list/comment',
        },
        {
            title: '产经',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/cj.html'],
            target: '/article/list/cj',
        },
        {
            title: '科创板',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/kcb.html'],
            target: '/article/list/kcb',
        },
        {
            title: '新三板',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/xsb.html'],
            target: '/article/list/xsb',
        },
        {
            title: 'ESG',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/zk.html'],
            target: '/article/list/zk',
        },
        {
            title: '滚动',
            source: ['www.stcn.com/article/list.html', 'www.stcn.com/article/list/gd.html'],
            target: '/article/list/gd',
        },
    ],
    view: ViewType.Articles,
};
