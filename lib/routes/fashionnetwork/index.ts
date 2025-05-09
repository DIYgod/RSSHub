import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { id = '0' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://fashionnetwork.cn';
    const currentUrl = new URL(`lists/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.home__item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('h2.family-title').text();

            const src = item.find('img.item__img').first().prop('src') ?? undefined;
            const image = src ? new URL(src, rootUrl).href : undefined;

            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });

            return {
                title,
                description,
                link: new URL(item.find('h2.family-title a').prop('href'), rootUrl).href,
                image,
                banner: image,
                language,
                enclosure_url: image,
                enclosure_type: image ? `image/${image.split(/\./).pop()}` : undefined,
                enclosure_title: title,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.newsTitle').text();
                const description = art(path.join(__dirname, 'templates/description.art'), {
                    description: $$('div.article-content').html(),
                });

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('span.time-ago').first().text().trim()), +8);
                item.category = $$('div.newsTags')
                    .first()
                    .find('div.news-tag')
                    .toArray()
                    .map((c) => $$(c).text());
                item.author = $$('div.newsLeftCol span').first().text();
                item.content = {
                    html: description,
                    text: $$('div.article-content').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const label = $(`label[for="news_categs_${id}"]`).text()?.split(/\(/)?.[0]?.trim() ?? '';
    const image = new URL($('div.header__fnw-logo img').prop('src'), rootUrl).href;

    return {
        title: `${label}${$('title').text()}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="author"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/cn/lists/:id?',
    name: 'FashionNetwork 中国',
    url: 'fashionnetwork.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/fashionnetwork/cn/lists/0',
    parameters: { category: '分类，默认为 0，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [独家新闻](https://fashionnetwork.cn)，网址为 \`https://fashionnetwork.cn/lists/13.html\`。截取 \`https://fashionnetwork.cn/\` 到末尾 \`.html\` 的部分 \`13\` 作为参数填入，此时路由为 [\`/fashionnetwork/cn/lists/13\`](https://rsshub.app/fashionnetwork/cn/lists/13)。
:::

| 分类                                           | ID                                                  |
| ---------------------------------------------- | --------------------------------------------------- |
| [独家](https://fashionnetwork.cn/lists/13)     | [13](https://rsshub.app/fashionnetwork/cn/lists/13) |
| [商业](https://fashionnetwork.cn/lists/1)      | [1](https://rsshub.app/fashionnetwork/cn/lists/1)   |
| [人物](https://fashionnetwork.cn/lists/8)      | [8](https://rsshub.app/fashionnetwork/cn/lists/8)   |
| [设计](https://fashionnetwork.cn/lists/3)      | [3](https://rsshub.app/fashionnetwork/cn/lists/3)   |
| [产业](https://fashionnetwork.cn/lists/5)      | [5](https://rsshub.app/fashionnetwork/cn/lists/5)   |
| [创新研究](https://fashionnetwork.cn/lists/6)  | [6](https://rsshub.app/fashionnetwork/cn/lists/6)   |
| [人事变动](https://fashionnetwork.cn/lists/12) | [12](https://rsshub.app/fashionnetwork/cn/lists/12) |
| [新闻资讯](https://fashionnetwork.cn/lists/11) | [11](https://rsshub.app/fashionnetwork/cn/lists/11) |
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
            source: ['fashionnetwork.cn/lists/:id'],
            target: (params) => {
                const id = params.id;

                return `/fashionnetwork/cn/lists${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '独家',
            source: ['fashionnetwork.cn/lists/13'],
            target: '/cn/lists/13',
        },
        {
            title: '商业',
            source: ['fashionnetwork.cn/lists/1'],
            target: '/cn/lists/1',
        },
        {
            title: '人物',
            source: ['fashionnetwork.cn/lists/8'],
            target: '/cn/lists/8',
        },
        {
            title: '设计',
            source: ['fashionnetwork.cn/lists/3'],
            target: '/cn/lists/3',
        },
        {
            title: '产业',
            source: ['fashionnetwork.cn/lists/5'],
            target: '/cn/lists/5',
        },
        {
            title: '创新研究',
            source: ['fashionnetwork.cn/lists/6'],
            target: '/cn/lists/6',
        },
        {
            title: '人事变动',
            source: ['fashionnetwork.cn/lists/12'],
            target: '/cn/lists/12',
        },
        {
            title: '新闻资讯',
            source: ['fashionnetwork.cn/lists/11'],
            target: '/cn/lists/11',
        },
    ],
};
