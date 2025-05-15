import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import type { Data, DataItem, Route } from '@/types';

const FEED_TITLE = 'Genossenschaften.immo' as const;
const FEED_LOGO = 'https://genossenschaften.immo/static/gimmo/img/favicon/favicon-128x128.png' as const;
const FEED_LANGUAGE = 'de' as const;
const BASE_URL = 'https://genossenschaften.immo' as const;
const PATH_PREFIX = '/genossenschaften/' as const;

export const route: Route = {
    name: 'Immobiliensuche',
    path: '*',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
Note that all parameters are optional and many can be specified multiple times
(e.g. \`district=wien-1-innere-stadt&district=wien-2-leopoldstadt\`).

Only returns the first page of search results, allowing you to keep track of
newly added apartments. If you're looking for an apartment, make sure to also
look through the other pages on the website.

:::tip
To get your query URL, go to https://genossenschaften.immo and apply all
desired filters. If you want to filter by (all districts of a) federal state
(e.g. \`/immobilien/regionen/wien/\`), please open the district selector and
de- and re-select any district, so that the region in the URL gets replaced
with a number of \`district\` parameters. Once you've set up all desired
filters, copy the part of the URL after the \`?\`.
:::
`,
    example:
        PATH_PREFIX +
        'district=wien-1-innere-stadt&district=wien-2-leopoldstadt&district=wien-3-landstrasse&district=wien-4-wieden&district=wien-5-margareten&district=wien-6-mariahilf&district=wien-7-neubau&district=wien-8-josefstadt&district=wien-9-alsergrund&district=wien-10-favoriten&district=wien-11-simmering&district=wien-12-meidling&district=wien-13-hietzing&district=wien-14-penzing&district=wien-15-rudolfsheim-fuenfhaus&district=wien-16-ottakring&district=wien-17-hernals&district=wien-18-waehring&district=wien-19-doebling&district=wien-20-brigittenau&district=wien-21-floridsdorf&district=wien-22-donaustadt&district=wien-23-liesing' +
        '&has_rent=on&has_rent_option=on' +
        '&status=available&status=construction' +
        '&cost=1000&room=2&size=50' +
        '&has_property=off&has_rent=on&has_rent_option=on' +
        '&status=available&status=construction&status=planned' +
        '&type=residence&type=project',
    parameters: {
        // labels are in german language because it's the same on the website
        cost: 'Miete bis (in €, number)',
        district: 'Bezirk (string, multiple)',
        size: 'Größe ab (in m², number)',
        room: 'Zimmer ab (number)',
        genossenschaft: 'Bauvereinigung (string, multiple)',
        own_funds: 'Eigenkapital bis',
        has_property: 'Eigentum (`on` | `off`)',
        has_rent: 'Miete (`on` | `off`)',
        has_rent_option: 'Miete mit Kaufoption (`on` | `off`)',
        status: 'multiple, `available` | `construction` | `planned`',
        type: 'multiple, `residence` | `project`',
        keywords: 'Keyword search',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    async handler(ctx) {
        let path = ctx.req.path.slice(PATH_PREFIX.length);
        if (path.startsWith('&')) {
            // in case request url is something like `/genossenschaften/&cost=…`
            path = path.slice(1);
        }

        const link = `${BASE_URL}/?${path}`;
        const response = await ofetch(link);
        const $ = load(response);

        const items = $('[itemtype="https://schema.org/Apartment"]')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const name = $el.find('[itemprop=name]').text();
                const body = $el.find('.card-body').text().trim();
                // UTC timestamp: <time datetime="2025-01-07T15:48:07.089153">
                const dateTime = $el.find('time').attr('datetime');
                const itemPubDate = dateTime ? new Date(dateTime + 'Z') : undefined;
                const itemLink = BASE_URL + $el.find('[itemprop=url]').attr('href');
                const itemImage = $el.find('[itemprop=image]').attr('href');

                // e.g. ['2', '60,00 m²', '500,00 €', '10.000,00 €']
                const numbers = $el
                    .find('.card-body .fs-5')
                    .toArray()
                    .map((el) => $(el).text().trim());

                // e.g. ['Verfügbar', 'OEVW', 'Miete', 'Wohneinheit']
                const itemCategories = $el
                    .find('.badge')
                    .toArray()
                    .map((el) => $(el).text().trim());

                const titleAppendix = numbers.length ? ` | ${numbers.join(' · ')}` : '';
                const itemTitle = name + titleAppendix;
                const itemDescription = itemCategories.join(' · ') + (body.length ? ` / ${body}` : '');

                return {
                    title: itemTitle,
                    link: itemLink,
                    pubDate: itemPubDate,
                    description: itemDescription,
                    category: itemCategories,
                    image: itemImage,
                } satisfies DataItem;
            });

        return {
            title: FEED_TITLE,
            language: FEED_LANGUAGE,
            logo: FEED_LOGO,
            allowEmpty: true,
            item: items,
            link,
        } satisfies Data;
    },
};
