import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';

const FEED_TITLE = 'Immobilien - BWSG' as const;
const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.bwsg.at/wp-content/uploads/2024/06/favicon-bwsg.png';
const SITE_URL = 'https://www.bwsg.at' as const;
const BASE_URL = `${SITE_URL}/immobilien/immobilie-suchen/`;

export const route: Route = {
    name: 'Angebote',
    example: '/bwsg/_vermarktungsart=miete&_objektart=wohnung&_zimmer=2,3&_wohnflaeche=45,70&_plz=1210,1220',
    path: '*',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
Copy the query parameters for your https://www.bwsg.at/immobilien/immobilie-suchen
search, omitting the leading \`?\`

::: tip
Since there's no parameter available that sorts by "last added" (and there's no
obvious pattern to the default ordering), and since this RSS feed only fetches
the first page of results, you probably want to specify enough search
parameters to make sure you only get one page of results – because else, your
RSS feed might not get all items.
:::`,

    async handler(ctx) {
        let params = getSubPath(ctx).slice(1);
        if (params.startsWith('&')) {
            params = params.slice(1);
        }

        const link = `${BASE_URL}?${params}`;
        const response = await ofetch(link);
        const $ = load(response);

        const items = $('[data-objektnummer] > a')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const link = el.attribs.href;
                const image = $el.find('.res_immobiliensuche__immobilien__item__thumb > img').attr('src');
                const title = $el.find('.res_immobiliensuche__immobilien__item__content__title').text().trim();
                const location = $el.find('.res_immobiliensuche__immobilien__item__content__meta__location').text().trim();
                const price = $el.find('.res_immobiliensuche__immobilien__item__content__meta__preis').text().trim();
                const metadata = $el.find('.res_immobiliensuche__immobilien__item__content__meta__row_1').text().trim();

                return {
                    title: `${location}, ${title}`,
                    description: (price ? `${price} | ` : '') + metadata,
                    link,
                    image,
                    // no pubDate :(
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
