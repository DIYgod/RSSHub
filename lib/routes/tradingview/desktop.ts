import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/desktop',
    categories: ['program-update'],
    example: '/tradingview/desktop',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tradingview.com/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/'],
        },
    ],
    name: 'Desktop releases and release notes',
    maintainers: ['nczitzk'],
    handler,
    url: 'tradingview.com/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL('/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    $('h4[data-identifyelement]').each((_, el) => {
        el = $(el);

        if (el.text().trim() === '') {
            el.remove();
        }
    });

    const items = $('h4[data-identifyelement]')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const title = item.text();
            const description = $.html(item.nextUntil('h4'));
            const content = load(description);

            return {
                title,
                link: currentUrl,
                description,
                category: content('h5')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `tradingview-desktop#${title.split(/versions?\s/).pop()}`,
                pubDate: timezone(parseDate(title.split(/\./)[0], 'MMMM D, YYYY'), +8),
            };
        });

    const title = $('title').text();
    const titleSplits = title.split(/—/);
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: titleSplits[0],
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: titleSplits[0],
        author: titleSplits.pop(),
    };
}
