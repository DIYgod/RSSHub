import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { year = new Date().getFullYear() } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 52;

    const rootUrl = 'https://www.niid.go.jp';
    const currentUrl = new URL(`niid/ja/idwr-dl/${year}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    const items = $('div.items-row')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            item.find('div.item-separator').remove();

            const title = item.find('div.item p').first().text();
            const description = item.find('div.item').html();
            const link = item.find('p.body1 a').prop('href');

            return {
                title,
                description,
                pubDate: parseDate(
                    item
                        .find('p.contents')
                        .text()
                        .match(/(\d{4}年\d{1,2}月\d{1,2}日)発行/)?.[1] ??
                        title.match(/(\d{4})年/)?.[1] ??
                        year,
                    ['YYYY年M月D日', 'YYYY']
                ),
                link,
                content: {
                    html: description,
                    text: item.find('div.item').text(),
                },
                updated: timezone(parseDate(item.find('.time').prop('datetime')), +8),
                language,
                enclosure_url: link,
                enclosure_type: link ? `application/${link.split(/\./).pop()}` : undefined,
                enclosure_title: link ? title : undefined,
            };
        });

    const image = new URL('niid/templates/gk_memovie/images/main_header.jpg', rootUrl).href;

    return {
        title: `感染症発生動向調査週報ダウンロード${$('title').text()}`,
        description: '感染症発生動向調査週報ダウンロード',
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: 'NIID国立感染症研究所',
        language,
    };
};

export const route: Route = {
    path: '/niid/idwr-dl/:year?',
    name: '感染症発生動向調査週報ダウンロード',
    url: 'www.niid.go.jp',
    maintainers: ['nczitzk'],
    handler,
    example: '/go/niid/idwr-dl/:year?',
    parameters: { year: 'Year, current year by default' },
    description: `:::tip
  If you subscribe to [感染症発生動向調査週報ダウンロード2024年](https://www.niid.go.jp/niid/ja/idwr-dl/2024.html)，where the URL is \`https://www.niid.go.jp/niid/ja/idwr-dl/2024.html\`, extract the part \`https://www.niid.go.jp/niid/ja/idwr-dl/\` to the end, which is \`.html\`, and use it as the parameter to fill in. Therefore, the route will be [\`/go/niid/idwr-dl/2024\`](https://rsshub.app/go/niid/idwr-dl/2024).
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
            source: ['www.niid.go.jp/niid/ja/idwr-dl/:year'],
            target: (params) => {
                const year = params.year;

                return `/niid/idwr-dl/${year ? `/${year}` : ''}`;
            },
        },
    ],
};
