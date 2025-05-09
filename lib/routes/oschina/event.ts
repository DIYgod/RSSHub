import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'latest' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.oschina.net';
    const targetUrl: string = new URL(`event?tab=${category}`, baseUrl).href;
    const apiUrl: string = new URL('action/ajax/get_more_event_list', baseUrl).href;

    const response = await ofetch(apiUrl, {
        method: 'post',
        body: {
            tab: category,
        },
    });
    const $: CheerioAPI = load(response);

    const targetResponse = await ofetch(targetUrl);
    const $target: CheerioAPI = load(targetResponse);
    const language = $target('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.event-item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('a.summary').text();
            const image: string | undefined = $el.find('header.item-banner img').attr('data-delay');
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: $el.html(),
            });
            const pubDateStr: string | undefined = $el.find('footer.when-where label').first().text();
            const linkUrl: string | undefined = $el.find('a.summary').attr('href');
            const categoryEl: Element = $el.find('footer.when-where label').last();
            const categories: string[] = [categoryEl.text()];
            const authorEls: Element[] = $el.find('div.sponsor').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.find('span').text(),
                    avatar: $authorEl.find('img').attr('data-delay'),
                };
            });
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
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

                    const title: string = $$('h1').text();
                    const image: string | undefined = $$('div.event-img img').attr('src');
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        images: image
                            ? [
                                  {
                                      src: image,
                                      alt: title,
                                  },
                              ]
                            : undefined,
                        description: $$('div.event-detail').html(),
                    });
                    const pubDateStr: string | undefined = $$('span.box-fl')
                        .filter((_, el) => $$(el).text().includes('时间'))
                        .next()
                        .text()
                        ?.split('至')[0]
                        ?.trim();
                    const linkUrl: string | undefined = $$('val[data-name="weixinUrl"]').attr('data-value');
                    const categories: string[] = [...(item.category ?? []), $$('div.cost span.c').text()].filter(Boolean);
                    const authorEls: Element[] = $$('div.user-list div.box-aw').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.find('h3').text(),
                            url: $$authorEl.find('a').attr('href'),
                            avatar: $$authorEl.prev().find('img').attr('src'),
                        };
                    });
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        link: linkUrl ?? item.link,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        image,
                        banner: image,
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    const extraLinkEls: Element[] = $$('div.aside-list ul li').toArray();
                    const extraLinks = extraLinkEls
                        .map((extraLinkEl) => {
                            const $$extraLinkEl: Cheerio<Element> = $$(extraLinkEl);

                            return {
                                url: $$extraLinkEl.find('a.list-item').attr('href'),
                                type: 'related',
                                content_html: $$extraLinkEl.find('a.list-item').html(),
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

    return {
        title: $target('title').text(),
        description: $target('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/event/:category?',
    name: '活动',
    url: 'www.oschina.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/oschina/event',
    parameters: {
        category: '分类，默认为 `latest`，即最新活动，可在对应分类页 URL 中找到',
    },
    description: `:::tip
若订阅 [强力推荐](https://www.oschina.net/event?tab=recommend)，网址为 \`https://www.oschina.net/event?tab=recommend\`，请截取 \`https://www.oschina.net/event?tab=\` 到末尾的部分 \`recommend\` 作为 \`category\` 参数填入，此时目标路由为 [\`/oschina/event/recommend\`](https://rsshub.app/oschina/event/recommend)。
:::

| 强力推荐  | 最新活动 |
| --------- | -------- |
| recommend | latest   |
`,
    categories: ['programming'],
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
            source: ['www.oschina.net'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const category: string | undefined = urlObj.searchParams.get('tab') ?? undefined;

                return `/oschina/event${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '强力推荐',
            source: ['www.oschina.net'],
            target: '/event/recommend',
        },
        {
            title: '最新活动',
            source: ['www.oschina.net'],
            target: '/event/latest',
        },
    ],
    view: ViewType.Articles,
};
