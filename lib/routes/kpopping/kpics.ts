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
    const { filter } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://kpopping.com';
    const targetUrl: string = new URL(`kpics${filter ? `/${filter}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.pics div.matrix div.cell')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('figcaption section').text();
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                images: $el.find('a.picture img').attr('src')
                    ? [
                          {
                              src: $el.find('a.picture img').attr('src'),
                              alt: title,
                          },
                      ]
                    : undefined,
            });
            const linkUrl: string | undefined = $el.find('a').first().attr('href');
            const authors: DataItem['author'] = $el.find('figcaption section a').contents().last().text();
            const image: string | undefined = $el.find('a.picture img').attr('src');

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
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

                    const title: string = $$('h1').contents().first().text();
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.pics').first().html(),
                    });
                    const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                    const categoryEls: Element[] = $$('div.buttons a').toArray();
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                    const authorEls: Element[] = $$('div.content-snippet aside:not(.like)').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);
                        const $$authorAEl: Cheerio<Element> = $$authorEl.find('a').last();

                        return {
                            name: $$authorAEl.text(),
                            url: new URL($$authorAEl.attr('href') as string, baseUrl).href,
                            avatar: $$authorEl.find('img').attr('src'),
                        };
                    });
                    const image: string | undefined = $$('meta[name="twitter:image"]').attr('content');
                    const upDatedStr: string | undefined = $$('meta[property="article:modified_time"]').attr('content');

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
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

                    const mediaEls: Element[] = $$('div.pics').first().find('img').toArray();
                    const medias: Record<string, Record<string, string>> = {};
                    let imageCount = 1;
                    for (const mediaEl of mediaEls) {
                        const $$mediaEl: Cheerio<Element> = $$(mediaEl);
                        const url: string | undefined = $$mediaEl.attr('src') ? new URL($$mediaEl.attr('src') as string, baseUrl).href : undefined;

                        if (!url) {
                            continue;
                        }

                        const medium: string = 'image';
                        const key: string = `${medium}${imageCount++}`;

                        medias[key] = {
                            url,
                            medium,
                            title: $$mediaEl.attr('alt') || title,
                            description: $$mediaEl.attr('alt') || title,
                            thumbnail: url,
                        };
                    }

                    if (Object.keys(medias).length > 0) {
                        processedItem = {
                            ...processedItem,
                            media: medias,
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
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/kpics/:filter{.+}?',
    name: 'Pics',
    url: 'kpopping.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/kpopping/kpics/gender-male/category-all/idol-any/group-any/order',
    parameters: {
        filter: 'Filter',
    },
    description: `::: tip
If you subscribe to [All male photo albums](https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order)，where the URL is \`https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order\`, extract the part \`https://kpopping.com/kpics/\` to the end, which is \`gender-male/category-all/idol-any/group-any/order\`, and use it as the parameter to fill in. Therefore, the route will be [\`/kpopping/kpics/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/kpics/gender-male/category-all/idol-any/group-any/order).
:::`,
    categories: ['picture'],
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
            source: ['kpopping.com/kpics/:filter'],
            target: (params) => {
                const filter: string = params.filter;

                return `/kpopping/kpics${filter ? `/${filter}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/kpics/:filter{.+}?',
        name: 'Pics',
        url: 'kpopping.com',
        maintainers: ['nczitzk'],
        handler,
        example: '/kpopping/kpics/gender-male/category-all/idol-any/group-any/order',
        parameters: {
            filter: '筛选，可在对应分类页 URL 中找到',
        },
        description: `::: tip
若订阅 [All male photo albums](https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order)，网址为 \`https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order\`，请截取 \`https://kpopping.com/kpics/\` 到末尾的部分 \`gender-male/category-all/idol-any/group-any/order\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/kpopping/kpics/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/kpics/gender-male/category-all/idol-any/group-any/order)。
:::
`,
    },
};
