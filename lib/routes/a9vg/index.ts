import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { category = 'news/All' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'http://www.a9vg.com';
    const currentUrl = new URL(`list/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('a.a9-rich-card-list_item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('img.a9-rich-card-list_image');
            const title = item.find('div.a9-rich-card-list_label').text();

            return {
                title,
                link: new URL(item.prop('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image.prop('src'),
                                  alt: title,
                              },
                          ]
                        : undefined,
                }),
                pubDate: timezone(parseDate(item.find('div.a9-rich-card-list_infos').text()), +8),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                $$('ignore_js_op img, p img').each((_, el) => {
                    el = $$(el);

                    el.parent().replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            images: el.prop('file')
                                ? [
                                      {
                                          src: el.prop('file'),
                                          alt: el.next().find('div.xs0 p').first().text(),
                                      },
                                  ]
                                : undefined,
                        })
                    );
                });

                item.title = $$('h1.ts, div.c-article-main_content-title').first().text();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: $$('td.t_f, div.c-article-main_contentraw').first().html(),
                });
                item.author =
                    $$('b a.blue').first().text() ||
                    $$(
                        $$('span.c-article-main_content-intro-item')
                            .toArray()
                            .findLast((i) => $$(i).text().startsWith('作者'))
                    )
                        .text()
                        .split(/：/)
                        .pop();
                item.pubDate = timezone(
                    parseDate(
                        $$('div.authi em')
                            .first()
                            .text()
                            .trim()
                            .match(/发表于 (\d+-\d+-\d+ \d+:\d+)/)?.[1] ?? $$('span.c-article-main_content-intro-item').first().text(),
                        ['YYYY-M-D HH:mm', 'YYYY-MM-DD HH:mm']
                    ),
                    +8
                );
                item.language = language;

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL('images/logo.1cee7c0f.svg', rootUrl).href;

    return {
        title,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '新闻',
    url: 'a9vg.com',
    maintainers: ['monnerHenster', 'nczitzk'],
    handler,
    example: '/a9vg/news',
    parameters: { category: '分类，默认为 ，可在对应分类页 URL 中找到, Category, by default' },
    description: `::: tip
  若订阅 [PS4](http://www.a9vg.com/list/news/PS4)，网址为 \`http://www.a9vg.com/list/news/PS4\`。截取 \`http://www.a9vg.com/list\` 到末尾的部分 \`news/PS4\` 作为参数填入，此时路由为 [\`/a9vg/news/PS4\`](https://rsshub.app/a9vg/news/PS4)。
:::

  | 分类                                               | ID                                                     |
  | -------------------------------------------------- | ------------------------------------------------------ |
  | [All](https://www.a9vg.com/list/news/All)          | [news/All](https://rsshub.app/a9vg/news/All)           |
  | [PS4](https://www.a9vg.com/list/news/PS4)          | [news/PS4](https://rsshub.app/a9vg/news/PS4)           |
  | [PS5](https://www.a9vg.com/list/news/PS5)          | [news/PS5](https://rsshub.app/a9vg/news/PS5)           |
  | [Switch](https://www.a9vg.com/list/news/Switch)    | [news/Switch](https://rsshub.app/a9vg/news/Switch)     |
  | [Xbox One](https://www.a9vg.com/list/news/XboxOne) | [news/XboxOne](https://rsshub.app/a9vg/news/XboxOne)   |
  | [XSX](https://www.a9vg.com/list/news/XSX)          | [news/XSX](https://rsshub.app/a9vg/news/XSX)           |
  | [PC](https://www.a9vg.com/list/news/PC)            | [news/PC](https://rsshub.app/a9vg/news/PC)             |
  | [业界](https://www.a9vg.com/list/news/Industry)    | [news/Industry](https://rsshub.app/a9vg/news/Industry) |
  | [厂商](https://www.a9vg.com/list/news/Factory)     | [news/Factory](https://rsshub.app/a9vg/news/Factory)   |
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
            source: ['www.a9vg.com/list/:category'],
            target: (params) => {
                const category = params.category;

                return category ? `/${category}` : '';
            },
        },
        {
            title: 'All',
            source: ['www.a9vg.com/list/news/All'],
            target: '/news/All',
        },
        {
            title: 'PS4',
            source: ['www.a9vg.com/list/news/PS4'],
            target: '/news/PS4',
        },
        {
            title: 'PS5',
            source: ['www.a9vg.com/list/news/PS5'],
            target: '/news/PS5',
        },
        {
            title: 'Switch',
            source: ['www.a9vg.com/list/news/Switch'],
            target: '/news/Switch',
        },
        {
            title: 'Xbox One',
            source: ['www.a9vg.com/list/news/XboxOne'],
            target: '/news/XboxOne',
        },
        {
            title: 'XSX',
            source: ['www.a9vg.com/list/news/XSX'],
            target: '/news/XSX',
        },
        {
            title: 'PC',
            source: ['www.a9vg.com/list/news/PC'],
            target: '/news/PC',
        },
        {
            title: '业界',
            source: ['www.a9vg.com/list/news/Industry'],
            target: '/news/Industry',
        },
        {
            title: '厂商',
            source: ['www.a9vg.com/list/news/Factory'],
            target: '/news/Factory',
        },
    ],
};
