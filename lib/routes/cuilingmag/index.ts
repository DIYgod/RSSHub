import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { category } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 12;

    const rootUrl = 'https://www.cuilingmag.com';
    const currentUrl = new URL(category ? `category/${category}` : '', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.new-list-div, div.item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('h3.new-list-h3, h3.title-font').first().text().trim();

            const src = item.find('img').first().prop('src');
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
                link: new URL(item.find('a').first().prop('href'), rootUrl).href,
                author: item.find('a.new-list-p, div.author').text().trim(),
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

                const title = `${$$('p.title-font').text().trim()} ${$$('p.subtitle-font').text().trim()}`;

                const src = $$('div.banner img').first().prop('src');
                const banner = src ? new URL(src, rootUrl).href : undefined;

                const description =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        images: banner
                            ? [
                                  {
                                      src: banner,
                                      alt: title,
                                  },
                              ]
                            : undefined,
                        description: $$('div.article-content').html(),
                    });

                item.title = title;
                item.description = description;
                item.pubDate = parseDate($$('p.time').first().text());
                item.category = [
                    ...new Set([
                        ...$$('p.sort a')
                            .toArray()
                            .map((c) => $$(c).text().trim()),
                        ...$$('span.type')
                            .toArray()
                            .map((c) => $$(c).text().trim()),
                    ]),
                ].filter(Boolean);
                item.author = $$('p.author a')
                    .toArray()
                    .map((a) => $$(a).contents().first().text().trim())
                    .join('/');
                item.content = {
                    html: description,
                    text: $$('div.article-content').text(),
                };
                item.banner = banner;
                item.language = language;
                item.enclosure_url = banner ?? item.enclosure_url;
                item.enclosure_type = banner ? `image/${banner.split(/\./).pop()}` : item.enclosure_type;
                item.enclosure_title = title;

                return item;
            })
        )
    );

    const title = $('title').text().trim();
    const image = new URL($('div.nav-logo a img').prop('src'), rootUrl).href;

    return {
        title,
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '分类',
    url: 'cuilingmag.com',
    categories: ['new-media', 'popular'],
    maintainers: ['nczitzk'],
    handler,
    example: '/cuilingmag',
    parameters: { category: '分类，默认为空，即全部，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [#哲学·文明](https://www.cuilingmag.com/category/philosophy_civilization)，网址为 \`https://www.cuilingmag.com/category/philosophy_civilization\`。截取 \`https://www.cuilingmag.com/category\` 到末尾的部分 \`philosophy_civilization\` 作为参数填入，此时路由为 [\`/cuilingmag/philosophy_civilization\`](https://rsshub.app/cuilingmag/philosophy_civilization)。
:::

  | 分类                                                                       | ID                                                                                |
  | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
  | [哲学 · 文明](https://www.cuilingmag.com/category/philosophy_civilization) | [philosophy_civilization](https://rsshub.app/cuilingmag/philosophy_civilization) |
  | [艺术 · 科技](https://www.cuilingmag.com/category/art_science)             | [art_science](https://rsshub.app/cuilingmag/art_science)                         |
  | [未来 · 生命](https://www.cuilingmag.com/category/future_life)             | [future_life](https://rsshub.app/cuilingmag/future_life)                         |
  | [行星智慧](https://www.cuilingmag.com/category/planetary_wisdom)           | [planetary_wisdom](https://rsshub.app/cuilingmag/planetary_wisdom)               |
  | [数字治理](https://www.cuilingmag.com/category/digital_governance)         | [digital_governance](https://rsshub.app/cuilingmag/digital_governance)           |
  | [Noema精选](https://www.cuilingmag.com/category/selected_noema)            | [selected_noema](https://rsshub.app/cuilingmag/selected_noema)                   |
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
            source: ['cuilingmag.com/category/:category'],
            target: (params) => {
                const category = params.category;

                return `/cuilingmag${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '全部',
            source: ['cuilingmag.com'],
            target: '/',
        },
        {
            title: '哲学 · 文明',
            source: ['cuilingmag.com/category/philosophy_civilization'],
            target: '/philosophy_civilization',
        },
        {
            title: '艺术 · 科技',
            source: ['cuilingmag.com/category/art_science'],
            target: '/art_science',
        },
        {
            title: '未来 · 生命',
            source: ['cuilingmag.com/category/future_life'],
            target: '/future_life',
        },
        {
            title: '行星智慧',
            source: ['cuilingmag.com/category/planetary_wisdom'],
            target: '/planetary_wisdom',
        },
        {
            title: '数字治理',
            source: ['cuilingmag.com/category/digital_governance'],
            target: '/digital_governance',
        },
        {
            title: 'Noema精选',
            source: ['cuilingmag.com/category/selected_noema'],
            target: '/selected_noema',
        },
    ],
};
