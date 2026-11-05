import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const FEED_TITLE = 'Wohnungen - Gesiba' as const;
const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.gesiba.at/assets/img/gesiba-logo.png';
const BASE_URL = 'https://www.gesiba.at' as const;
export const route: Route = {
    name: 'Angebote',
    example: '/gesiba/verfuegbar=alle&plz[]=1100&plz[]=1120&size-from=45&size-to=80&rooms-from=2&rooms-to=3&betreuung=0',
    path: '/:path{.+}?',
    parameters: { path: 'Search filter parameters, see the description below' },
    maintainers: ['sk22'],
    categories: ['other'],
    description: `Note that, on <https://www.gesiba.at/immobilien/wohnungen>, filters are added to
the URL like \`&filter[plz]=1100,1120\`, but the endpoint used here expects it
like \`&plz[]=1100&plz[]=1120\`, if multiple values are passed to one parameter`,

    async handler(ctx) {
        let params = ctx.req.param('path') ?? '';
        if (params.startsWith('&')) {
            params = params.slice(1);
        }

        const searchPage = await ofetch<string>(`${BASE_URL}/immobilien/wohnungen`);
        const $searchPage = load(searchPage);
        const component = $searchPage('.sprig-component[data-hx-vals]').first();
        const endpoint = component.attr('data-hx-get');
        const values = component.attr('data-hx-vals');
        if (!endpoint || !values) {
            throw new Error('GESIBA did not provide the apartment search component configuration.');
        }
        const link = new URL(endpoint, BASE_URL);
        const query = new URLSearchParams(params);
        for (const [key, value] of query) {
            link.searchParams.append(key, value);
        }
        const configuration = JSON.parse(values) as Record<string, string>;
        for (const [key, value] of Object.entries(configuration)) {
            link.searchParams.set(key, value);
        }
        const response = await ofetch<string>(link.href);
        const $ = load(response);

        const items = $('#object-result a.card')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const link = BASE_URL + el.attribs.href;
                const image = BASE_URL + $el.find('img').attr('src');
                const title = $el.find('.card-title').text().trim();
                const price = $el.find('.price').text().trim();
                const subtitle = $el
                    .find('.mb-3 > p')
                    .toArray()
                    .map((el) => $(el).text().trim())
                    .join(', ');
                const tagline = $el
                    .find('.seperated:first-child > *')
                    .toArray()
                    .map((el) => $(el).text().trim())
                    .join(', ');
                const metadata = $el
                    .find('.justify-content-between > .flex-column > *')
                    .toArray()
                    .map((el) => $(el).text().trim())
                    .join(', ');

                const description = (price ? `${price}, ` : '') + metadata + (tagline ? `, ${tagline}` : '');

                return {
                    // add metadata to identifier so that rss readers display a new item
                    // when only the count (i.e. available rentals) gets changed
                    guid: `${link}#${encodeURIComponent(metadata)}`,
                    title: `${title}, ${subtitle}`,
                    link,
                    description,
                    image,
                    content: { html: $el.html() ?? $el.text(), text: $el.text() },
                    // no pubDate :(
                } satisfies DataItem;
            });

        return {
            title: FEED_TITLE,
            language: FEED_LANGUAGE,
            logo: FEED_LOGO,
            item: items,
            link: `${BASE_URL}/immobilien/wohnungen`,
        } satisfies Data;
    },
};
