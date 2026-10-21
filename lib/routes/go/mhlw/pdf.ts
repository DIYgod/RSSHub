import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

export const handler = async (ctx) => {
    const { category = 'stf/seisakunitsuite/bunya/houkokusuunosuii' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.mhlw.go.jp';
    const currentUrl = `${rootUrl}/${category.endsWith('.html') ? category : `${category}.html`}`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    const items = $('a[data-icon="pdf"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);

            const title = $item.find('font').text() || $item.text();
            const link = new URL($item.prop('href')!, rootUrl).href;

            return {
                title,
                link,
                language,
                enclosure_url: link,
                enclosure_type: 'application/pdf',
                enclosure_title: title,
            };
        });

    const image = new URL($('div.m-headerLogo img').prop('src')!, rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
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

If you subscribe to [新型コロナウイルス感染症の定点当たり報告数の推移](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/houkokusuunosuii.html)，where the URL is \`https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/houkokusuunosuii.html\`, Use the path \`stf/seisakunitsuite/bunya/houkokusuunosuii\` as the category parameter. The resulting route is [\`/go/mhlw/pdf/stf/seisakunitsuite/bunya/houkokusuunosuii\`](https://rsshub.app/go/mhlw/pdf/stf/seisakunitsuite/bunya/houkokusuunosuii).
:::`,
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
            source: ['www.mhlw.go.jp/*category'],
            target: '/mhlw/pdf/:category',
        },
    ],
};
