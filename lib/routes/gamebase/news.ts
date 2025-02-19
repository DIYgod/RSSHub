import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

const __dirname = getCurrentPath(import.meta.url);

const types = {
    newslist: 'newsList',
    r18list: 'newsPornList',
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { type = 'newslist', category = 'all' } = ctx.req.param();

    if (!types.hasOwnProperty(type)) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }

    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://news.gamebase.com.tw';
    const targetUrl: string = new URL(`news${category === 'all' ? '' : `/newslist?type=${category}`}`, baseUrl).href;
    const apiBaseUrl: string = 'https://api.gamebase.com.tw';
    const apiUrl: string = new URL('api/news/getNewsList', apiBaseUrl).href;

    const response = await ofetch(apiUrl, {
        method: 'post',
        body: {
            GB_type: types[type],
            category,
            page: 1,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-TW';

    const items: DataItem[] = await Promise.all(
        response.return_msg?.list?.slice(0, limit).map((item) =>
            cache.tryGet(`gamebase-news-${item.news_no}`, async (): Promise<DataItem> => {
                const title: string = item.news_title;
                const pubDate: number | string = item.post_time;
                const linkUrl: string | undefined = item.news_no ? `news/detail/${item.news_no}` : undefined;
                const categories: string[] = [item.system];
                const authors: DataItem['author'] = item.nickname;
                const guid: string = `gamebase-news-${item.news_no}`;
                const image: string | undefined = item.news_img;
                const updated: number | string = item.updated ?? pubDate;

                let metaDesc = item.news_meta?.meta_des;

                if (!metaDesc) {
                    const detailResponse = await ofetch(item.link);

                    metaDesc = (detailResponse.match(/(\\u003C.*?)","/)?.[1] ?? '').replaceAll(String.raw`\"`, '"').replaceAll(/\\u([\da-f]{4})/gi, (match, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
                }

                const description: string = art(path.join(__dirname, 'templates/description.art'), {
                    images:
                        image && !metaDesc
                            ? [
                                  {
                                      src: image,
                                      alt: title,
                                  },
                              ]
                            : undefined,
                    intro: item.news_short_desc,
                    description: metaDesc,
                });

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                    category: categories,
                    author: authors,
                    guid,
                    id: guid,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: updated ? timezone(parseDate(updated), +8) : undefined,
                    language,
                };

                return processedItem;
            })
        ) ?? []
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:title"]').attr('content')?.split(/\|/).pop()?.trim(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/news/:type?/:category?',
    name: '新聞',
    url: 'news.gamebase.com.tw',
    maintainers: ['nczitzk'],
    handler,
    example: '/gamebase/news',
    parameters: {
        type: '類型，見下表，預設為 newslist',
        category: '分類，預設為 `all`，即全部，可在對應分類頁 URL 中找到',
    },
    description: `:::tip
若訂閱 [手機遊戲新聞](https://news.gamebase.com.tw/news/newslist?type=mobile)，網址為 \`https://news.gamebase.com.tw/news/newslist?type=mobile\`，請截取 \`https://news.gamebase.com.tw/news/\` 到末尾的部分 \`newslist\` 作為 \`type\` 參數填入，\`mobile\` 作為 \`category\` 參數填入，此時目標路由為 [\`/gamebase/news/newslist/mobile\`](https://rsshub.app/gamebase/news/newslist/mobile)。
:::

| newslist | r18list |
| -------- | ------- |
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
            source: ['news.gamebase.com.tw/news', 'news.gamebase.com.tw/news/:type'],
            target: (params, url) => {
                const type: string = params.type;
                const urlObj: URL = new URL(url);
                const category: string | undefined = urlObj.searchParams.get('type') ?? undefined;

                return `/gamebase/news${type ? `/${type}${category ? `/${category}` : ''}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/news/:type?/:category?',
        name: '新闻',
        url: 'news.gamebase.com.tw',
        maintainers: ['nczitzk'],
        handler,
        example: '/gamebase/news',
        parameters: {
            type: '类型，见下表，默认为 newslist',
            category: '分类，默认为 `all`，即全部，可在对应分类页 URL 中找到',
        },
        description: `:::tip
若订阅 [手机游戏新闻](https://news.gamebase.com.tw/news/newslist?type=mobile)，网址为 \`https://news.gamebase.com.tw/news/newslist?type=mobile\`，请截取 \`https://news.gamebase.com.tw/news/\` 到末尾的部分 \`newslist\` 作为 \`type\` 参数填入，\`mobile\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gamebase/news/newslist/mobile\`](https://rsshub.app/gamebase/news/newslist/mobile)。
:::

| newslist | r18list |
| -------- | ------- |
`,
    },
};
