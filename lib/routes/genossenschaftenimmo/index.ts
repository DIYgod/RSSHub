import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import type { Data, DataItem, Route } from '@/types';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

const FEED_TITLE = 'Genossenschaften.immo';
const FEED_LOGO = 'https://genossenschaften.immo/static/gimmo/img/favicon/favicon-128x128.png';
const FEED_LANGUAGE = 'de';
const BASE_URL = 'https://genossenschaften.immo';

export const route: Route = {
    name: 'Immobiliensuche',
    path: '*',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
Note that all parameters are optional and many can be specified multiple times
(e.g. \`&district=wien-1-innere-stadt&district=wien-2-leopoldstadt\`).

Only returns the first page of search results, allowing you to keep track of
newly added apartments. If you're looking for an apartment, make sure to also
look through the other pages on the website.

:::tip
To get your query URL, go to https://genossenschaften.immo, open your browser's
dev tools (F12 or Ctrl+Shift+I) and go to the Network tab and filter for
XHR/Fetch requests. On the website, set up your search parameters. As the
results refresh, you'll see new requests to https://genossenschaften.immo/?…
coming in. Copy everything starting with the \`?\` to the end of the URL.
:::
`,
    example:
        '/genossenschaftenimmo' +
        '?district=wien-1-innere-stadt&district=wien-2-leopoldstadt&district=wien-3-landstrasse&district=wien-4-wieden&district=wien-5-margareten&district=wien-6-mariahilf&district=wien-7-neubau&district=wien-8-josefstadt&district=wien-9-alsergrund&district=wien-10-favoriten&district=wien-11-simmering&district=wien-12-meidling&district=wien-13-hietzing&district=wien-14-penzing&district=wien-15-rudolfsheim-fuenfhaus&district=wien-16-ottakring&district=wien-17-hernals&district=wien-18-waehring&district=wien-19-doebling&district=wien-20-brigittenau&district=wien-21-floridsdorf&district=wien-22-donaustadt&district=wien-23-liesing' +
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
        // `?cost=1000&district=wien-1-innere-stadt&…`
        const { search } = new URL(ctx.req.url);
        // path might be something like `/genossenschaftenimmo/immobilien/regionen/wien`
        const path = ctx.req.path.slice('/genossenschaftenimmo/'.length);
        const link = `${BASE_URL}/${path}${search}`;
        const response = await ofetch(link);
        const $ = load(response);

        const items = $('[itemtype="https://schema.org/Apartment"]')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const name = $el.find('[itemprop=name]').text();
                const body = $el.find('.card-body').text().trim();
                const dateTime = $el.find('time').attr('datetime');
                const itemLink = BASE_URL + $el.find('[itemprop=url]').attr('href');
                const itemImage = $el.find('[itemprop=image]').attr('href');
                const itemPubDate = dayjs.tz(dateTime, 'Europe/Vienna').toISOString();

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
