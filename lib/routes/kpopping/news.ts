import path from 'node:path';

import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '2', 10);

    const baseUrl: string = 'https://kpopping.com';
    const targetUrl: string = new URL(`news${filter ? `/${filter}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('section.news-list-item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h4.title-wr a').last();

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('time.datetime-wr').attr('datetime');
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = [$el.find('h4.title-wr a').first()];
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authorEls: Element[] = $el.find('aside.author-wr').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);
                const $authorAEl: Cheerio<Element> = $authorEl.find('a').last();

                return {
                    name: $authorAEl.text(),
                    url: new URL($authorAEl.attr('href') as string, baseUrl).href,
                    avatar: new URL($el.find('aside.author-wr a img').attr('src') as string, baseUrl).href,
                };
            });
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr, 'MMM D, YYYY h:mma'), +8) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                doi: $el.find('meta[name="citation_doi"]').attr('content'),
                updated: upDatedStr ? timezone(parseDate(upDatedStr, 'MMM D, YYYY h:mma'), +8) : undefined,
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
                        images: $$('figure.opening img').attr('src')
                            ? [
                                  {
                                      src: new URL($$('figure.opening img').attr('src') as string, baseUrl).href,
                                      alt: title,
                                  },
                              ]
                            : undefined,
                        description: $$('div#article-content').html(),
                    });
                    const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                    const categoryEls: Element[] = $$('aside.info a, div.supplements a.item').toArray();
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()?.trim()).filter(Boolean))];
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
                    const image: string | undefined = $$('meta[property="og:image"]').attr('content');
                    const upDatedStr: string | undefined = $$('meta[property="article:modified_time"]').attr('content');

                    const processedItem: DataItem = {
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
    path: '/news/:filter{.+}?',
    name: 'News',
    url: 'kpopping.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/kpopping/news/gender-all/category-all/idol-any/group-any/order',
    parameters: {
        filter: 'Filter',
    },
    description: `::: tip
If you subscribe to [All male articles](https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order)，where the URL is \`https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order\`, extract the part \`https://kpopping.com/news\` to the end, which is \`gender-male/category-all/idol-any/group-any/order\`, and use it as the parameter to fill in. Therefore, the route will be [\`/kpopping/news/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/news/gender-male/category-all/idol-any/group-any/order).
:::
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
            source: ['kpopping.com/news/:filter'],
            target: (params) => {
                const filter: string = params.filter;

                return `/kpopping/news${filter ? `/${filter}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/news/:filter{.+}?',
        name: 'News',
        url: 'kpopping.com',
        maintainers: ['nczitzk'],
        handler,
        example: '/kpopping/news/gender-all/category-all/idol-any/group-any/order',
        parameters: {
            filter: '筛选，可在对应分类页 URL 中找到',
        },
        description: `::: tip
若订阅 [All male articles](https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order)，网址为 \`https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order\`，请截取 \`https://kpopping.com/news/\` 到末尾的部分 \`gender-male/category-all/idol-any/group-any/order\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/kpopping/news/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/news/gender-male/category-all/idol-any/group-any/order)。
:::
`,
    },
};
