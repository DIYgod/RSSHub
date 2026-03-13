import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const FEED_TITLE = 'WOGEM' as const;
const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.wogem.at/de/favicon.ico';
const BASE_URL = 'https://www.wogem.at/de/' as const;

export const route: Route = {
    name: 'Angebote',
    example: '/wogem/angebote?filter=Graz',
    path: '/:page?',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `Pass in the name of the php file, e.g. \`angebote\` for \`/de/angebote.php\`\`.`,
    parameters: {
        page: 'Page name, e.g. `angebote` for `angebote.php. Defaults to `angebote`',
    },

    async handler(ctx) {
        const page = ctx.req.param('page') || 'angebote';
        const link = `${BASE_URL}${page}.php`;

        const response = await ofetch(link);
        const $ = load(response);
        const heading = $('h1').text().split('\n')[0].trim();

        const items = $('.col-md-12 > h3 > a')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const href = $el.attr('href');
                const title = $el.text();

                return {
                    title,
                    link: href?.startsWith('?') ? link + href : href,
                    // no pubDate or image :(
                } satisfies DataItem;
            });

        return {
            title: `${heading} - ${FEED_TITLE}`,
            language: FEED_LANGUAGE,
            logo: FEED_LOGO,
            allowEmpty: true,
            item: items,
            link,
        } satisfies Data;
    },
};
