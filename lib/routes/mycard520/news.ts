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
    const { category = 'cardgame' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '18', 10);

    const baseUrl: string = 'https://app.mycard520.com.tw';
    const targetUrl: string = new URL(`category/${category.endsWith('/') ? category : `${category}/`}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-TW';

    let items: DataItem[] = [];

    $('div.page_numbers').remove();

    items = $('div#tab1 ul li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a');

            const title: string = $el.find('div.text_box p').text();
            const description: string | undefined = $aEl.html() ?? undefined;
            const pubDateStr: string | undefined = $el.find('div.date').text().trim();
            const linkUrl: string | undefined = $aEl.attr('href');
            const image: string | undefined = $el.find('div.img_box img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                content: {
                    html: description ?? '',
                    text: description ?? '',
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
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
                    const $$pageBox: Cheerio<Element> = $$('div.page_box');

                    const title: string = $$pageBox.find('h2').text();
                    const pubDateStr: string | undefined = $$('div.date').first().text();
                    const upDatedStr: string | undefined = pubDateStr;

                    $$pageBox.find('h2, div.date, .the_champ_sharing_container').remove();

                    const description: string | undefined = $$pageBox.html() ?? item.description;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        content: {
                            html: description ?? '',
                            text: description ?? '',
                        },
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
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
        description: $('meta[name="keywords"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.logo img').attr('src'),
        author: $('title').text().split(/-/).pop()?.trim(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/category/:category?',
    name: '遊戲新聞',
    url: 'app.mycard520.com.tw',
    maintainers: ['nczitzk'],
    handler,
    example: '/mycard520/category/cardgame',
    parameters: {
        category: {
            description: '分类，默认为 `cardgame`，即最新遊戲，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '最新遊戲',
                    value: 'cardgame',
                },
                {
                    label: '手機遊戲',
                    value: 'cardgame-mobile',
                },
                {
                    label: 'PC 遊戲',
                    value: 'cardgame-pc',
                },
                {
                    label: '電競賽事',
                    value: 'cardgame-esports',
                },
                {
                    label: '實況直播',
                    value: 'cardgame-live',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [最新遊戲](https://app.mycard520.com.tw/category/cardgame/)，网址为 \`https://app.mycard520.com.tw/category/cardgame/\`，请截取 \`https://app.mycard520.com.tw/category/\` 到末尾 \`/\` 的部分 \`cardgame\` 作为 \`category\` 参数填入，此时目标路由为 [\`/mycard520/category/cardgame\`](https://rsshub.app/mycard520/category/cardgame)。
:::

| [最新遊戲](https://app.mycard520.com.tw/category/cardgame/) | [手機遊戲](https://app.mycard520.com.tw/category/cardgame-mobile/)       | [PC 遊戲](https://app.mycard520.com.tw/category/cardgame-pc/)    | [電競賽事](https://app.mycard520.com.tw/category/cardgame-esports/)        | [實況直播](https://app.mycard520.com.tw/category/cardgame-live/)     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [cardgame](https://rsshub.app/mycard520/category/cardgame)  | [cardgame-mobile](https://rsshub.app/mycard520/category/cardgame-mobile) | [cardgame-pc](https://rsshub.app/mycard520/category/cardgame-pc) | [cardgame-esports](https://rsshub.app/mycard520/category/cardgame-esports) | [cardgame-live](https://rsshub.app/mycard520/category/cardgame-live) |
`,
    categories: ['game'],
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
            source: ['app.mycard520.com.tw/category/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/mycard520${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '最新遊戲',
            source: ['app.mycard520.com.tw/category/cardgame'],
            target: '/category/cardgame',
        },
        {
            title: '手機遊戲',
            source: ['app.mycard520.com.tw/category/cardgame-mobile'],
            target: '/category/cardgame-mobile',
        },
        {
            title: 'PC 遊戲',
            source: ['app.mycard520.com.tw/category/cardgame-pc'],
            target: '/category/cardgame-pc',
        },
        {
            title: '電競賽事',
            source: ['app.mycard520.com.tw/category/cardgame-esports'],
            target: '/category/cardgame-esports',
        },
        {
            title: '實況直播',
            source: ['app.mycard520.com.tw/category/cardgame-live'],
            target: '/category/cardgame-live',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/category/:category?',
        name: '游戏新闻',
        url: 'app.mycard520.com.tw',
        maintainers: ['nczitzk'],
        handler,
        example: '/mycard520/category/cardgame',
        parameters: {
            category: {
                description: '分类，默认为 `cardgame`，即最新游戏，可在对应分类页 URL 中找到',
                options: [
                    {
                        label: '最新游戏',
                        value: 'cardgame',
                    },
                    {
                        label: '手机游戏',
                        value: 'cardgame-mobile',
                    },
                    {
                        label: 'PC 游戏',
                        value: 'cardgame-pc',
                    },
                    {
                        label: '电竞赛事',
                        value: 'cardgame-esports',
                    },
                    {
                        label: '实况直播',
                        value: 'cardgame-live',
                    },
                ],
            },
        },
        description: `::: tip
若订阅 [最新游戏](https://app.mycard520.com.tw/category/cardgame/)，网址为 \`https://app.mycard520.com.tw/category/cardgame/\`，请截取 \`https://app.mycard520.com.tw/category/\` 到末尾 \`/\` 的部分 \`cardgame\` 作为 \`category\` 参数填入，此时目标路由为 [\`/mycard520/category/cardgame\`](https://rsshub.app/mycard520/category/cardgame)。
:::

| [最新游戏](https://app.mycard520.com.tw/category/cardgame/) | [手机游戏](https://app.mycard520.com.tw/category/cardgame-mobile/)       | [PC 游戏](https://app.mycard520.com.tw/category/cardgame-pc/)    | [电竞赛事](https://app.mycard520.com.tw/category/cardgame-esports/)        | [实况直播](https://app.mycard520.com.tw/category/cardgame-live/)     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [cardgame](https://rsshub.app/mycard520/category/cardgame)  | [cardgame-mobile](https://rsshub.app/mycard520/category/cardgame-mobile) | [cardgame-pc](https://rsshub.app/mycard520/category/cardgame-pc) | [cardgame-esports](https://rsshub.app/mycard520/category/cardgame-esports) | [cardgame-live](https://rsshub.app/mycard520/category/cardgame-live) |
`,
    },
};
