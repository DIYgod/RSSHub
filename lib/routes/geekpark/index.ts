import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx) => {
    const { column } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://geekpark.net';
    const apiRootUrl = 'https://mainssl.geekpark.net';
    const currentUrl = new URL(column ? `column/${column}` : '', rootUrl).href;
    const apiUrl = new URL(column ? `api/v1/columns/${column}` : 'api/v2', apiRootUrl).href;

    const { data: response } = await got(apiUrl);

    let items = (response.homepage_posts ?? response.column.posts).slice(0, limit).map((item) => {
        item = item.post ?? item;

        const title = item.title;
        const image = item.cover_url;
        const description = renderDescription({
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            intro: item.abstract,
        });
        const guid = `geekpark-${item.id}`;

        return {
            title,
            description,
            pubDate: parseDate(item.published_timestamp, 'X'),
            link: new URL(`api/v1/posts/${item.id}`, apiRootUrl).href,
            category: [...new Set([...item.tags, item.column?.title])].filter(Boolean),
            author: item.authors.map((a) => a.realname ?? a.nickname).join('/'),
            guid,
            id: guid,
            content: {
                html: description,
                text: item.abstract,
            },
            image,
            banner: image,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const data = detailResponse.post;

                const title = data.title;
                const image = data.cover_url;
                const description = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    intro: data.abstract,
                    description: data.content,
                });
                const guid = `geekpark-${data.id}`;

                item.title = title;
                item.description = description;
                item.pubDate = parseDate(data.published_timestamp, 'X');
                item.link = new URL(`news/${data.id}`, rootUrl).href;
                item.category = [...new Set([...data.tags, data.column?.title])].filter(Boolean);
                item.author = data.authors.map((a) => a.realname ?? a.nickname).join('/');
                item.guid = guid;
                item.id = guid;
                item.content = {
                    html: description,
                    text: data.content,
                };
                item.image = image;
                item.banner = image;
                item.updated = parseDate(data.updated_at);

                return item;
            })
        )
    );

    const data = {
        title: '',
        description: '',
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image: '',
        author: '',
    };

    if (column) {
        data.title = `${response.column.title} | 极客公园`;
        data.description = response.column.description;
        data.image = response.column.banner_url;
    } else {
        const { data: currentResponse } = await got(currentUrl);

        const $ = load(currentResponse);

        data.title = $('title').text();
        data.description = $('meta[property="og:description"]').prop('content');
        data.image = `https:${$('meta[name="og:image"]').prop('content')}`;
        data.author = $('meta[property="og:site_name"]').prop('content');
    }

    return data;
};

export const route: Route = {
    path: '/:column?',
    name: '栏目',
    url: 'geekpark.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/geekpark',
    parameters: { column: '栏目 id，默认为空，即首页资讯，可在对应栏目页 URL 中找到' },
    description: `::: tip
  若订阅 [综合报道](https://www.geekpark.net/column/179)，网址为 \`https://www.geekpark.net/column/179\`。截取 \`https://www.geekpark.net/column/\` 到末尾的部分 \`179\` 作为参数填入，此时路由为 [\`/geekpark/179\`](https://rsshub.app/geekpark/179)。
:::

| 栏目                                                         | ID                                     |
| ------------------------------------------------------------ | -------------------------------------- |
| [综合报道](https://www.geekpark.net/column/179)              | [179](https://rsshub.app/geekpark/179) |
| [AI新浪潮观察](https://www.geekpark.net/column/304)          | [304](https://rsshub.app/geekpark/304) |
| [新造车观察](https://www.geekpark.net/column/305)            | [305](https://rsshub.app/geekpark/305) |
| [财报解读](https://www.geekpark.net/column/271)              | [271](https://rsshub.app/geekpark/271) |
| [底稿对话CEO系列](https://www.geekpark.net/column/308)       | [308](https://rsshub.app/geekpark/308) |
| [Geek Insight 特稿系列](https://www.geekpark.net/column/306) | [306](https://rsshub.app/geekpark/306) |
| [心科技](https://www.geekpark.net/column/307)                | [307](https://rsshub.app/geekpark/307) |
| [行业资讯](https://www.geekpark.net/column/2)                | [2](https://rsshub.app/geekpark/2)     |
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
            source: ['geekpark.net'],
            target: '/',
        },
        {
            source: ['geekpark.net/column/:column?'],
            target: (params) => {
                const column = params.column;

                return column ? `/${column}` : '';
            },
        },
        {
            title: '综合报道',
            source: ['www.geekpark.net/column/179'],
            target: '/179',
        },
        {
            title: 'AI新浪潮观察',
            source: ['www.geekpark.net/column/304'],
            target: '/304',
        },
        {
            title: '新造车观察',
            source: ['www.geekpark.net/column/305'],
            target: '/305',
        },
        {
            title: '财报解读',
            source: ['www.geekpark.net/column/271'],
            target: '/271',
        },
        {
            title: '底稿对话CEO系列',
            source: ['www.geekpark.net/column/308'],
            target: '/308',
        },
        {
            title: 'Geek Insight 特稿系列',
            source: ['www.geekpark.net/column/306'],
            target: '/306',
        },
        {
            title: '心科技',
            source: ['www.geekpark.net/column/307'],
            target: '/307',
        },
        {
            title: '行业资讯',
            source: ['www.geekpark.net/column/2'],
            target: '/2',
        },
    ],
};
