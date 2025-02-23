import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import iconv from 'iconv-lite';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 23 } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://lol.qq.com';
    const apiBaseUrl: string = 'https://apps.game.qq.com';
    const targetUrl: string = new URL('news/index.shtml', baseUrl).href;
    const apiListUrl: string = new URL('cmc/zmMcnTargetContentList', apiBaseUrl).href;
    const apiInfoUrl: string = new URL('cmc/zmMcnContentInfo', apiBaseUrl).href;

    const response = await ofetch(apiListUrl, {
        query: {
            page: 1,
            num: limit,
            target: category,
        },
    });
    const targetResponse = await ofetch(targetUrl, {
        responseType: 'arrayBuffer',
    });

    const $: CheerioAPI = load(iconv.decode(Buffer.from(targetResponse), 'gbk'));
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.data.result.slice(0, limit).map((item): DataItem => {
        const title: string = item.sTitle;
        const pubDate: number | string = item.sCreated;
        const linkUrl: string | undefined = item.iDocID ? `${item.iVideoId ? 'v/v2' : 'news'}/detail.shtml?docid=${item.iDocID}` : undefined;
        const authors: DataItem['author'] = item.sAuthor
            ? [
                  {
                      name: item.sAuthor,
                      avatar: item.sCreaterHeader,
                  },
              ]
            : undefined;
        const guid: string = item.iDocID;
        const image: string | undefined = item.sIMG ? (item.sIMG.startsWith('http') ? item.sIMG : `https:${item.sIMG}`) : undefined;
        const updated: number | string = item.updated ?? pubDate;

        const processedItem: DataItem = {
            title,
            pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
            author: authors,
            guid,
            id: guid,
            image,
            banner: image,
            updated: updated ? timezone(parseDate(updated), +8) : undefined,
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
                    const detailResponse = await ofetch(apiInfoUrl, {
                        query: {
                            type: 0,
                            docid: item.guid,
                        },
                    });

                    const result = detailResponse?.data?.result ?? undefined;

                    if (!result) {
                        return item;
                    }

                    const title: string = result.sTitle;
                    const description: string = result.sContent;
                    const pubDate: number | string = result.sCreated;
                    const linkUrl: string | undefined = result.iDocID ? `${result.iVideoId ? 'v/v2' : 'news'}/detail.shtml?docid=${result.iDocID}` : undefined;
                    const authors: DataItem['author'] = result.sAuthor
                        ? [
                              {
                                  name: result.sAuthor,
                                  avatar: result.sCreaterHeader,
                              },
                          ]
                        : undefined;
                    const guid: string = `qq-lol-${result.iDocID}`;
                    const image: string | undefined = result.sIMG ? (result.sIMG.startsWith('http') ? result.sIMG : `https:${result.sIMG}`) : undefined;
                    const updated: number | string = result.sIdxTime ?? pubDate;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
                        link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
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

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: `${$('div.website-path a')
            .toArray()
            .map((a) => $(a).text())
            .join('')} - ${$(`li[data-newsId="${category}"]`).text()}`,
        description: $('meta[name="Description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: `https:${$('a.logo img').attr('src')}`,
        author: $('meta[name="author"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/lol/news/:category?',
    name: '英雄联盟新闻',
    url: 'lol.qq.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/qq/lol/news',
    parameters: {
        category: '分类，默认为 `23`，即综合，见下表',
    },
    description: `:::tip
若订阅 [英雄联盟首页新闻列表 - 公告](https://lol.qq.com/news/index.shtml)，网址为 \`https://lol.qq.com/news/index.shtml\`，请选择 \`24\` 作为 \`category\` 参数填入，此时目标路由为 [\`/qq/lol/news/24\`](https://rsshub.app/qq/lol/news/24)。
:::

| 综合 | 公告 | 赛事 | 攻略 | 社区 |
| ---- | ---- | ---- | ---- | ---- |
| 23   | 24   | 25   | 27   | 28   |
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
            title: '综合',
            source: ['lol.qq.com/news/index.shtml'],
            target: '/lol/news/23',
        },
        {
            title: '公告',
            source: ['lol.qq.com/news/index.shtml'],
            target: '/lol/news/24',
        },
        {
            title: '赛事',
            source: ['lol.qq.com/news/index.shtml'],
            target: '/lol/news/25',
        },
        {
            title: '攻略',
            source: ['lol.qq.com/news/index.shtml'],
            target: '/lol/news/27',
        },
        {
            title: '社区',
            source: ['lol.qq.com/news/index.shtml'],
            target: '/lol/news/28',
        },
    ],
    view: ViewType.Articles,
};
