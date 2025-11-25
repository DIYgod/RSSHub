import { load } from 'cheerio';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';
import type { Data, DataItem, Route } from '@/types';

const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.wiensued.at/wp-content/uploads/logo_wiensued_ohneclaim.svg';
const BASE_URL = 'https://www.wiensued.at/' as const;

export const route: Route = {
    name: 'Objekte',
    example: '/wiensued/city=Wien&search=&space-from=30&space-to=100&room-from=2&room-to=4&rent=1&property=1&state[]=inplanung&state[]=inbau&state[]=sofort&state[]=bestand',
    path: '*',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
Pass in the parameters (e.g. \`city=Wien&state[]=sofort\`) and/or the path
leading up to the listing (e.g. \`wohnen/sofort-verfuegbar\`)
`,

    async handler(ctx) {
        // ['', 'wohnen', 'sofort-verfuegbar', 'city=Wien']
        const parts = getSubPath(ctx).split('/');
        const subPaths = parts.filter((p) => p.length && !p.includes('='));
        if (subPaths.length === 0) {
            subPaths.push('wohnen');
        }

        let params = parts.at(-1).includes('=') ? parts.at(-1) : '';
        if (params.startsWith('&')) {
            params = params.slice(1);
        }

        const link = `${BASE_URL}${subPaths.join('/')}?${params}`;
        const response = await ofetch(link);
        const $ = load(response);
        const title = $('title').text();

        const items = $('#search-results') // element: 'SUCHERGEBNISSE'
            .next() // sort controls
            .next() // '#objects-tile-view'
            .find('.object-box')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const $image = $el.find('.image img');
                const link = $el.find('.link a').attr('href');
                const image = $image.attr('data-lazy-src') || $image.attr('src');
                const title = $el.find('.address h4').first().text().trim();
                const subtitle = $el.find('.address p').first().text().trim();
                const $text = $el.find('.text');
                const description = $text
                    .find('.labtxtline')
                    .toArray()
                    .map((el) =>
                        $(el)
                            .children()
                            .toArray()
                            .map((c) => $(c).text().trim())
                            .join(': ')
                    )
                    .join(', ');

                return {
                    title: `${title}, ${subtitle}`,
                    link,
                    description,
                    image,
                    content: { html: $text.html() ?? $text.text(), text: $text.text() },
                    // no pubDate :(
                } satisfies DataItem;
            });

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
