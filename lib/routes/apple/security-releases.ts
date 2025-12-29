import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/security-releases';

export const handler = async (ctx: Context): Promise<Data> => {
    const { language = 'en-us' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://support.apple.com';
    const targetUrl: string = new URL(`${language}/100100`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);

    const $trEls: Cheerio<Element> = $('table.gb-table tbody tr');
    const headers: string[] = $trEls
        .find('th')
        .toArray()
        .map((el) => $(el).text());

    let items: DataItem[] = [];

    items = $trEls
        .slice(1, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const titleEl: Cheerio<Element> = $el.find('td').first();
            const title: string = titleEl.contents().first().text();
            const description: string | undefined = renderDescription({
                headers,
                infos: $el
                    .find('td')
                    .toArray()
                    .map((el) => $(el).html() ?? ''),
            });
            const pubDateStr: string | undefined = $el.find('td').last().text();
            const linkUrl: string | undefined = titleEl.find('a.gb-anchor').attr('href');
            const authors: DataItem['author'] = $el.find('meta[property="og:site_name"]').attr('content');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, ['DD MMM YYYY', 'YYYY 年 MM 月 DD 日']) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                updated: upDatedStr ? parseDate(upDatedStr, ['DD MMM YYYY', 'YYYY 年 MM 月 DD 日']) : undefined,
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

                const title: string = item.title ?? $$('h1.gb-header').text();

                $$('h1.gb-header').remove();

                const description: string | undefined =
                    item.description +
                    renderDescription({
                        description: $$('div#sections').html(),
                    });
                const pubDateStr: string | undefined = detailResponse.match(/publish_date:\s"(\d{8})",/, '')?.[1];
                const authors: DataItem['author'] = $$('meta[property="og:site_name"]').attr('content');
                const upDatedStr: string | undefined = $$('.time').text() || pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr, 'MMDDYYYY') : item.pubDate,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? parseDate(upDatedStr, 'MMDDYYYY') : item.updated,
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
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/security-releases/:language?',
    name: 'Security releases',
    url: 'support.apple.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/apple/security-releases',
    parameters: {
        language: {
            description: 'Language, `en-us` by default',
        },
    },
    description: `::: tip
To subscribe to [Apple security releases](https://support.apple.com/en-us/100100), where the source URL is \`https://support.apple.com/en-us/100100\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/apple/security-releases/en-us\`](https://rsshub.app/apple/security-releases/en-us).
:::
`,
    categories: ['program-update'],
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
            source: ['support.apple.com/:language/100100'],
            target: (params) => {
                const language: string = params.language;

                return `/apple/security-releases${language ? `/${language}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/security-releases/:language?',
        name: '安全性发布',
        url: 'support.apple.com',
        maintainers: ['nczitzk'],
        handler,
        example: '/apple/security-releases',
        parameters: {
            language: {
                description: '语言，默认为 `en-us`，可在对应页 URL 中找到',
            },
        },
        description: `::: tip
若订阅 [Apple 安全性发布](https://support.apple.com/zh-cn/100100)，网址为 \`https://support.apple.com/zh-cn/100100\`，请截取 \`https://support.apple.com/\` 到末尾 \`/100100\` 的部分 \`zh-cn\` 作为 \`language\` 参数填入，此时目标路由为 [\`/apple/security-releases/zh-cn\`](https://rsshub.app/apple/security-releases/zh-cn)。
:::
`,
    },
};
