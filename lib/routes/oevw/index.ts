import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const FEED_LANGUAGE = 'de' as const;
const FEED_TITLE = 'ÖVW Suche' as const;
const FEED_LOGO = 'https://www.oevw.at/assetversion-035142/img/layout/touch-icon.png';
const ORIGIN_URL = 'https://www.oevw.at' as const;
const BASE_URL = `${ORIGIN_URL}/suche` as const;
const API_URL = `${BASE_URL}/filter` as const;

const csrfTokenRegex = /csrfToken\s*=\s*['"](.*?)["']/;

export const route: Route = {
    name: FEED_TITLE,
    example: '/oevw/{"rooms":["2","3"]}',
    path: '/:json?',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
When applying a filter on https://www.oevw.at/suche, a POST request is sent
to https://www.oevw.at/suche/filter. You can use the JSON body as a parameter
for this route.`,

    async handler(ctx) {
        const json = JSON.parse(ctx.req.param('json') || '{}');

        // first, get https://www.oevw.at/suche to extract csrf token and cookies
        const res = await ofetch.raw(BASE_URL);
        const cookies = res.headers.getSetCookie().map((setCookie) => setCookie.split(';')[0].trim());
        const csrfToken = csrfTokenRegex.exec(res._data)![1];
        const headers = {
            Origin: ORIGIN_URL,
            Cookie: cookies.join(';'),
            'X-CSRF-Token': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            Accept: '*/*',
        };

        // then, fetch the filter api endpoint with all necessary headers acquired
        const response = await ofetch(API_URL, { body: JSON.stringify(json), method: 'POST', headers });
        const $ = load(response);

        const items = $('.thumb')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const subtitle = $el.find('.thumb__info').text();
                const title = $el.find('.thumb__heading').text();
                const badge = $el.find('.thumb__badge').text().trim();
                const link = $el.find('.thumb__link a').attr('href');
                const image = $el.find('.thumb__image').attr('src');
                const description = $el
                    .find('.thumb__text__item')
                    .toArray()
                    .map((item) => $(item).text())
                    .join(', ');

                return {
                    title: `${subtitle} – ${title}`,
                    link,
                    description: (badge ? `${badge}, ` : '') + description,
                    image: `${ORIGIN_URL}/${image}`,
                    category: badge ? [badge] : undefined,
                    // no pubDate :(
                } satisfies DataItem;
            });

        return {
            title: FEED_TITLE,
            language: FEED_LANGUAGE,
            logo: FEED_LOGO,
            allowEmpty: true,
            item: items,
            link: BASE_URL,
        } satisfies Data;
    },
};
