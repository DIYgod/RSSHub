import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.wbv-gpa.at/app/uploads/2024/01/cropped-WBV-Favicon-192x192.png';
const SITE_URL = 'https://www.wbv-gpa.at' as const;
const BASE_URL = `${SITE_URL}/angebote/` as const;

export const route: Route = {
    name: 'Angebote',
    example: '/wbv-gpa/wohnungen/wien',
    path: '/:category?/:state?',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
Search housing by WBV-GPA, see "Angebote" menu item in https://www.wbv-gpa.at.
Filtering by state is done client-side.
`,
    parameters: {
        category: 'Anything behind `/angebote/` in the URL. Default: `wohnungen`',
        state: 'Optionally filter by Austrian state (`wien`, `steiermark`, ...)',
    },
    radar: [
        {
            // wbv-gpa.at/wohnungen is equivalent to wbv-gpa.at/angebote/wohnungen
            source: [`${SITE_URL}/wohnungen/`, `${BASE_URL}/:category`],
            target: '/:category',
        },
    ],

    async handler(ctx) {
        const category = ctx.req.param('category') || 'wohnungen';
        const state = ctx.req.param('state');

        const link = BASE_URL + category;
        const response = await ofetch(link);
        const $ = load(response);
        const title = $('title').text();

        const items = $('.objects__list__rows__item.mix')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const link = $el.find('a').attr('href');
                const title = $el
                    .find('.objects__list__rows__item__info__cell:not(.desktop_only):not(.objects__list__rows__item__info__cell--link)')
                    .toArray()
                    .map((el) => $(el).text().trim())
                    .join(', ');
                const description = $el
                    .find('.objects__list__rows__item__info__cell.desktop_only:not(.objects__list__rows__item__info__cell--link)')
                    .toArray()
                    .map((el) => $(el).text().trim())
                    .join(', ');

                // no pubDate and no image :(
                return state && !$el.hasClass(state) ? false : ({ title, description, link } satisfies DataItem);
            })
            .filter((item) => item !== false);

        return {
            title,
            language: FEED_LANGUAGE,
            logo: FEED_LOGO,
            allowEmpty: true,
            item: items,
            link,
        } satisfies Data;
    },
};
