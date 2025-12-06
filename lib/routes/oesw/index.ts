import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';

const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.oesw.at/fileadmin/Logos/OeSW_AG/OeSW-Logo2024-RGB.png';
const SITE_URL = 'https://www.oesw.at' as const;
const BASE_URL = `${SITE_URL}/immobilienangebot/` as const;

export const route: Route = {
    name: 'Immobilienangebot',
    example: '/oesw/sofort-verfuegbar/objectType=1&financingType=2&region=1020',
    path: '*',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `Get your parameters on ${SITE_URL} under "Immobilienangebot".
Make sure to remove the \`?\` at the beginning from the query parameters!`,

    async handler(ctx) {
        // ['', 'sofort-verfuegbar', 'objectType=1&region=1010']
        const parts = getSubPath(ctx).split('/');
        const listingPage = parts[1] || 'immobiliensuche';
        let params = parts[2] || '';
        if (params.startsWith('&')) {
            params = params.slice(1);
        }

        const link = `${BASE_URL}${listingPage}.html?${params}`;
        const response = await ofetch(link);
        const $ = load(response);
        const title = $('title').text();

        const items = $('li[data-objlist-url] > a')
            .toArray()
            .map((el) => {
                const count = $(el).find('.boardPic > .count').text().trim();
                const category = $(el)
                    .find('.boardPic > .label')
                    .toArray()
                    .map((l) => $(l).text().trim())
                    .filter((l) => l.length);
                const titles = [el.attribs['data-title2'].trim(), el.attribs['data-title'].trim()].filter((t) => t.length);
                const imageSrc = el.attribs['data-largesrc'];
                const image = imageSrc.startsWith('/') ? SITE_URL + imageSrc : imageSrc;

                return {
                    // add count to identifier so that rss readers display a new item
                    // when only the count (i.e. available rentals) gets changed
                    guid: el.attribs.href + (count ? `#count-${count}` : ''),
                    title: (count ? `(${count}) ` : '') + titles.join(', '),
                    link: el.attribs.href,
                    description: el.attribs['data-description'],
                    category,
                    image,
                    content: { html: el.attribs['data-description-long'], text: el.attribs['data-description-long'] },
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
