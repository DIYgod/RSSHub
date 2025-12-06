import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { year = new Date().getFullYear() } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://id-info.jihs.go.jp';
    const targetUrl: string = new URL(`surveillance/idwr/jp/idwr/${year}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'ja';

    const author: string = $('span.drawer-branding__subtitle').text();

    const items: DataItem[] = $('a.sizeview')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $pEl: Cheerio<Element> = $el.parent('p');

            const title: string = $pEl.prev('h2').text();
            const description: string | undefined = $pEl.html() ?? undefined;
            const pubDateStr: string | undefined = $pEl.text().match(/〔(\d{4}年\d{1,2}月\d{1,2}日)発行〕/)?.[1];
            const linkUrl: string | undefined = $el.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            let processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, 'YYYY年M月D日') : undefined,
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                author,
                content: {
                    html: description,
                    text: description,
                },
                updated: upDatedStr ? parseDate(upDatedStr, 'YYYY年M月D日') : undefined,
                language,
            };

            const $enclosureEl: Cheerio<Element> = $el;
            const enclosureUrl: string | undefined = linkUrl ? new URL(linkUrl, targetUrl).href : undefined;

            if (enclosureUrl) {
                const enclosureType: string = `application/${enclosureUrl.split(/\./).pop()}`;
                const enclosureTitle: string = $enclosureEl.text();

                processedItem = {
                    ...processedItem,
                    enclosure_url: enclosureUrl,
                    enclosure_type: enclosureType,
                    enclosure_title: enclosureTitle || title,
                    enclosure_length: undefined,
                };
            }

            return processedItem;
        });

    return {
        title: $('title').text(),
        description: $('meta[name="keywords"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.common-branding__logo-image').attr('src') ? new URL($('img.common-branding__logo-image').attr('src') as string, baseUrl).href : undefined,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/jihs/idwr/:year?',
    name: '感染症発生動向調査週報',
    url: 'id-info.jihs.go.jp',
    maintainers: ['nczitzk'],
    handler,
    example: '/go/jihs/idwr/2025',
    parameters: {
        year: {
            description: 'Year, current year by default',
        },
    },
    description: `::: tip
To subscribe to [感染症発生動向調査週報](https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/), where the source URL is \`https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/go/jihs/idwr/2025\`](https://rsshub.app/go/jihs/idwr/2025).
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
            source: ['id-info.jihs.go.jp/surveillance/idwr/jp/idwr/:year'],
            target: (params) => {
                const year: string = params.year;

                return `/go/jihs/idwr${year ? `/${year}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/jihs/idwr/:year?',
        name: '传染病发生动向调查周报',
        url: 'id-info.jihs.go.jp',
        maintainers: ['nczitzk'],
        handler,
        example: '/go/jihs/idwr/2025',
        parameters: {
            year: {
                description: '年份，默认为当前年份，可在对应页 URL 中找到',
            },
        },
        description: `::: tip
若订阅 [传染病发生动向调查周报](https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/)，网址为 \`https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/\`，请截取 \`https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/\` 到末尾 \`/\` 的部分 \`2025\` 作为 \`year\` 参数填入，此时目标路由为 [\`/go/jihs/idwr/2025\`](https://rsshub.app/go/jihs/idwr/2025)。
:::
`,
    },
};
