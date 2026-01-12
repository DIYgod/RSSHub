import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'news' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '7', 10);

    const baseUrl = 'http://www.ccg.org.cn';
    const targetUrl: string = new URL(category, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('ul.huodong-list li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('h5').text();
            const image: string | undefined = $el.find('div.huodong-img img').attr('src');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('p').html() || undefined,
            });
            const pubDateStr: string | undefined = $el.find('span').text();
            const linkUrl: string | undefined = $el.find('a').attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, 'YYYY年M月D日') : undefined,
                link: linkUrl,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr, 'YYYY年M月D日') : undefined,
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

                const title: string = $$('div.pinpai-page h3').text();
                const pubDateStr: string | undefined = $$('span.time').text();

                $$('div.pinpai-page h3').remove();
                $$('div.pinpai-page span.time').remove();

                const description: string | undefined = renderDescription({
                    description: $$('div.pinpai-page').html() || undefined,
                });

                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr, 'YYYY年M月D日') : item.pubDate,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? parseDate(upDatedStr, 'YYYY年M月D日') : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const author: string = $('h1.nav-logo').first().text();

    return {
        title: `${author} - ${$('title').text()}`,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('wp-content/themes/ccg/imgs/nav-logo.png', baseUrl).href,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '动态',
    url: 'www.ccg.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/ccg/news',
    parameters: {
        category: {
            description: '分类，默认为 `news`，即新闻动态，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '新闻动态',
                    value: 'news',
                },
                {
                    label: '媒体报道',
                    value: 'mtbd',
                },
            ],
        },
    },
    description: `::: tip
订阅 [新闻动态](http://www.ccg.org.cn/news)，其源网址为 \`http://www.ccg.org.cn/news\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/ccg/news\`](https://rsshub.app/ccg/news)。
:::

| 分类                                   | ID                                  |
| -------------------------------------- | ----------------------------------- |
| [新闻动态](http://www.ccg.org.cn/news) | [news](https://rsshub.app/ccg/news) |
| [媒体报道](http://www.ccg.org.cn/mtbd) | [mtbd](https://rsshub.app/ccg/mtbd) |
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
            source: ['www.ccg.org.cn/category'],
            target: '/:category',
        },
        {
            title: '新闻动态',
            source: ['www.ccg.org.cn/news'],
            target: '/news',
        },
        {
            title: '媒体报道',
            source: ['www.ccg.org.cn/mtbd'],
            target: '/mtbd',
        },
    ],
    view: ViewType.Articles,
};
