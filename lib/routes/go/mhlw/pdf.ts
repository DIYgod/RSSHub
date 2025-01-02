import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';

export const handler = async (ctx) => {
    const { category = 'stf/seisakunitsuite/bunya/houkokusuunosuii' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.mhlw.go.jp';
    const currentUrl = new URL(category.endsWith('.html') ? category : `${category}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    const items = $('a[data-icon="pdf"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('font').text() || item.text();
            const link = new URL(item.prop('href'), rootUrl).href;

            return {
                title,
                link,
                language,
                enclosure_url: link,
                enclosure_type: link ? 'application/pdf' : undefined,
                enclosure_title: title,
            };
        });

    const image = new URL($('div.m-headerLogo img').first().prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/mhlw/pdf/:category{.+}?',
    name: 'PDF',
    url: 'www.mhlw.go.jp',
    maintainers: ['nczitzk'],
    handler,
    example: '/go/mhlw/pdf/stf/seisakunitsuite/bunya/houkokusuunosuii',
    parameters: { category: 'Category, `stf/seisakunitsuite/bunya/houkokusuunosuii` as 新型コロナウイルス感染症の定点当たり報告数の推移 by default' },
    description: `::: tip
  Subscribing to this route will give you access to all PDF files on this page.

  If you subscribe to [新型コロナウイルス感染症の定点当たり報告数の推移](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/houkokusuunosuii.html)，where the URL is \`https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/houkokusuunosuii.html\`, extract the part \`https://www.mhlw.go.jp/\` to the end, which is \`.html\`, and use it as the parameter to fill in. Therefore, the route will be [\`/go/mhlw/stf/seisakunitsuite/bunya/houkokusuunosuii\`](https://rsshub.app/go/mhlw/stf/seisakunitsuite/bunya/houkokusuunosuii).
:::
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
            source: ['www.mhlw.go.jp'],
            target: (_, url) => {
                const category = new URL(url).href.match(/mhlw\.go\.jp\/(.*)$/)?.[1] ?? undefined;

                return `/mhlw/pdf${category ? `/${category}` : ''}`;
            },
        },
    ],
};
