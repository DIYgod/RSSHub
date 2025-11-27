import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';

const FEED_TITLE = 'Wohnungen - Gesiba' as const;
const FEED_LANGUAGE = 'de' as const;
const FEED_LOGO = 'https://www.gesiba.at/assets/img/gesiba-logo.png';
const BASE_URL = 'https://www.gesiba.at' as const;
const MAGIC_QUERY_PARAMS =
    `p=actions/sprig-core/components/render&sprig%3AsiteId=0347ff5aeebc536543e7e865c4ed9dd97a9eb81ef054d47105ba6c4ca1da10801&sprig%3Aid=37ff8c3b5f5f7ad3bca87140e3fb8094cc656fcdc5d705c964065a830717c906component-vvyfgj&sprig%3Acomponent=e0737af02d4f2e1586c10610b098b6f75b51b994ddbd89cafd13ef07dc6da9ca&sprig%3Atemplate=3b669582a22c2742c4b713143ea4663ddba00812852f876074de96ad2fc04c24_components%2F_objectList&sprig%3Avariables%5BbaseUrl%5D=0c66aec55b6b038f0c9eb2ddea75d44d0c52b6fbc93960847d53f9d0af3f6162%2Fimmobilien%2Fwohnungen` as const;

// https://www.gesiba.at/index.php?p=actions/sprig-core/components/render&verfuegbar=alle&size-from=&size-to=&rooms-from=&rooms-to=&betreuung=&sprig%3AsiteId=0347ff5aeebc536543e7e865c4ed9dd97a9eb81ef054d47105ba6c4ca1da10801&sprig%3Aid=37ff8c3b5f5f7ad3bca87140e3fb8094cc656fcdc5d705c964065a830717c906component-vvyfgj&sprig%3Acomponent=e0737af02d4f2e1586c10610b098b6f75b51b994ddbd89cafd13ef07dc6da9ca&sprig%3Atemplate=3b669582a22c2742c4b713143ea4663ddba00812852f876074de96ad2fc04c24_components%2F_objectList&sprig%3Avariables%5BbaseUrl%5D=0c66aec55b6b038f0c9eb2ddea75d44d0c52b6fbc93960847d53f9d0af3f6162%2Fimmobilien%2Fwohnungen

export const route: Route = {
    name: 'Angebote',
    example: '/gesiba/verfuegbar=alle&plz[]=1100&plz[]=1120&size-from=45&size-to=80&rooms-from=2&rooms-to=3&betreuung=0',
    path: '*',
    maintainers: ['sk22'],
    categories: ['other'],
    description: `
Note that, on https://www.gesiba.at/immobilien/wohnungen, filters are added to
the URL like \`&filter[plz]=1100,1120\`, but the endpoint used here expects it
like \`&plz[]=1100&plz[]=1120\`, if multiple values are passed to one parameter
`,

    async handler(ctx) {
        let params = getSubPath(ctx).slice(1);
        if (params.startsWith('&')) {
            params = params.slice(1);
        }

        const link = `${BASE_URL}/index.php?${MAGIC_QUERY_PARAMS}&${params}`;
        const response = await ofetch(link);
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
            allowEmpty: true,
            item: items,
            link,
        } satisfies Data;
    },
};
