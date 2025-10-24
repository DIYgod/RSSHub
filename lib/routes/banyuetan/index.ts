import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'jinritan' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'http://www.banyuetan.org';
    const targetUrl: string = new URL(`byt/${id}/index.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('div.bty_tbtj_list ul.clearFix li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h3 a');

            const title: string = $aEl.text();
            const image: string | undefined = $el.find('img').attr('src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('p').text(),
            });
            const pubDateStr: string | undefined = $el.find('span.tag3').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
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

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.detail_tit h1').text();
                const description: string | undefined =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div#detail_content').html(),
                    });
                const pubDateStr: string | undefined = $$('meta[property="og:release_date"]').attr('content');
                const categories: string[] = $$('META[name="keywords"]').attr('content')?.split(/,/) ?? [];
                const authorEls: Element[] = [...$$('META[name="author"]').toArray(), ...$$('META[name="source"]').toArray()];
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.attr('content'),
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const title: string = $('title').text();

    return {
        title,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('static/v1/image/logo.png', baseUrl).href,
        author: title.split(/—/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:id?',
    name: '栏目',
    url: 'www.banyuetan.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/banyuetan/jinritan',
    parameters: {
        id: {
            description: '栏目 ID，默认为 `jinritan`，即今日谈，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '今日谈',
                    value: 'jinritan',
                },
                {
                    label: '时政讲解',
                    value: 'shizhengjiangjie',
                },
                {
                    label: '评论',
                    value: 'banyuetanpinglun',
                },
                {
                    label: '基层治理',
                    value: 'jicengzhili',
                },
                {
                    label: '文化',
                    value: 'wenhua',
                },
                {
                    label: '教育',
                    value: 'jiaoyu',
                },
            ],
        },
    },
    description: `::: tip
订阅 [今日谈](http://www.banyuetan.org/byt/jinritan/)，其源网址为 \`http://www.banyuetan.org/byt/jinritan/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/banyuetan/jinritan\`](https://rsshub.app/banyuetan/jinritan)。
:::

| 栏目                                                                 | ID                                                                |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [今日谈](http://www.banyuetan.org/byt/jinritan/index.html)           | [jinritan](https://rsshub.app/banyuetan/jinritan)                 |
| [时政讲解](http://www.banyuetan.org/byt/shizhengjiangjie/index.html) | [shizhengjiangjie](https://rsshub.app/banyuetan/shizhengjiangjie) |
| [评论](http://www.banyuetan.org/byt/banyuetanpinglun/index.html)     | [banyuetanpinglun](https://rsshub.app/banyuetan/banyuetanpinglun) |
| [基层治理](http://www.banyuetan.org/byt/jicengzhili/index.html)      | [jicengzhili](https://rsshub.app/banyuetan/jicengzhili)           |
| [文化](http://www.banyuetan.org/byt/wenhua/index.html)               | [wenhua](https://rsshub.app/banyuetan/wenhua)                     |
| [教育](http://www.banyuetan.org/byt/jiaoyu/index.html)               | [jiaoyu](https://rsshub.app/banyuetan/jiaoyu)                     |

`,
    categories: ['traditional-media'],
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
            source: ['www.banyuetan.org/byt/:id'],
            target: '/:id',
        },
        {
            title: '今日谈',
            source: ['www.banyuetan.org/byt/jinritan/index.html'],
            target: '/jinritan',
        },
        {
            title: '时政讲解',
            source: ['www.banyuetan.org/byt/shizhengjiangjie/index.html'],
            target: '/shizhengjiangjie',
        },
        {
            title: '评论',
            source: ['www.banyuetan.org/byt/banyuetanpinglun/index.html'],
            target: '/banyuetanpinglun',
        },
        {
            title: '基层治理',
            source: ['www.banyuetan.org/byt/jicengzhili/index.html'],
            target: '/jicengzhili',
        },
        {
            title: '文化',
            source: ['www.banyuetan.org/byt/wenhua/index.html'],
            target: '/wenhua',
        },
        {
            title: '教育',
            source: ['www.banyuetan.org/byt/jiaoyu/index.html'],
            target: '/jiaoyu',
        },
    ],
    view: ViewType.Articles,
};
