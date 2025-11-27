import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { category = 'fgw_zxxxgk' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://fgw.sh.gov.cn';
    const currentUrl = new URL(`${category}/index.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.nowrapli li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').prop('title'),
                pubDate: parseDate(item.find('span.time').text()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.endsWith('.html')) {
                    item.enclosure_url = item.link;
                    item.enclosure_type = item.link ? `application/${item.link.split(/\./).pop()}` : undefined;
                    item.enclosure_title = item.title;

                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('meta[name="ArticleTitle"]').prop('content');
                const image = $$('div.pdf-content img').first().prop('src');
                const description = art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('div#ivs_content').html(),
                });

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('meta[name="PubDate"]').prop('content')), +8);
                item.category = [...new Set([$$('meta[name="ColumnName"]').prop('content'), $$('meta[name="ColumnKeywords"]').prop('content')])].filter(Boolean);
                item.author = $$('meta[name="ContentSource"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div#ivs_content').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                const enclosureUrl = $$('div.pdf-content a, div.xgfj a').first().prop('href');

                item.enclosure_url = enclosureUrl ? new URL(enclosureUrl, rootUrl).href : undefined;
                item.enclosure_type = enclosureUrl ? `application/${enclosureUrl.split(/\./).pop()}` : undefined;
                item.enclosure_title = title;

                return item;
            })
        )
    );

    const author = $('meta[name="SiteName"]').prop('content');
    const image = $('span.logo-icon img').prop('src');

    return {
        title: `${author} - ${$('meta[name="ColumnName"]').prop('content')}`,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: ['/sh/fgw/:category{.+}?', '/shanghai/fgw/:category{.+}?'],
    name: '上海市发展和改革委员会',
    url: 'fgw.sh.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/sh/fgw/fgw_zxxxgk',
    parameters: { category: '分类，默认为 `fgw_zxxxgk`，即最新信息公开，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [最新信息公开](https://fgw.sh.gov.cn/fgw_zxxxgk/index.html)，网址为 \`https://fgw.sh.gov.cn/fgw_zxxxgk/index.html\`。截取 \`https://fgw.sh.gov.cn/\` 到末尾 \`/index.html\` 的部分 \`fgw_zxxxgk\` 作为参数填入，此时路由为 [\`/gov/sh/fgw/fgw_zxxxgk\`](https://rsshub.app/gov/sh/fgw/fgw_zxxxgk)。
:::

| 最新信息公开 | 要闻动态   |
| ------------ | ---------- |
| fgw_zxxxgk   | fgw_fzggdt |
  `,
    categories: ['government'],

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
            source: ['fgw.sh.gov.cn/:category'],
            target: (params) => {
                const category = params.category.replace(/\/index\.html/, '');

                return `/gov/sh/fgw${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '最新信息公开',
            source: ['fgw.sh.gov.cn/fgw_zxxxgk/index.html'],
            target: '/sh/fgw/fgw_zxxxgk',
        },
        {
            title: '要闻动态',
            source: ['fgw.sh.gov.cn/fgw_fzggdt/index.html'],
            target: '/sh/fgw/fgw_fzggdt',
        },
    ],
};
