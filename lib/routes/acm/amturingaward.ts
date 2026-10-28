import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/amturingaward',
    categories: ['programming'],
    example: '/acm/amturingaward',
    name: 'A.M.Turing Award Winners',
    features: {
        antiCrawler: true,
    },
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://amturing.acm.org';
    const currentUrl = `${rootUrl}/byyear.cfm`;
    const initialResponse = await ofetch.raw<string>(currentUrl, { ignoreResponseError: true });
    const cookie = initialResponse.headers
        .getSetCookie()
        .map((value) => value.split(';', 1)[0])
        .join('; ');
    let response = initialResponse._data;
    if (!initialResponse.ok) {
        if (initialResponse.status !== 403 || !cookie) {
            throw new Error(`The ACM source returned HTTP ${initialResponse.status}.`);
        }
        response = await ofetch(currentUrl, { headers: { Cookie: cookie } });
    }

    const $ = load(response ?? '');

    const items = await Promise.all(
        $('.award-winners-list li')
            .slice(0, 5)
            .toArray()
            .map(async (item) => {
                const $item = $(item);

                const year = $item.find('span').text().replaceAll(/[()]/g, '');

                const winnersUrls = $item
                    .find('a')
                    .toArray()
                    .map((a) => `${rootUrl}${$(a).attr('href')}`);
                const winners = await Promise.all(winnersUrls.map((url) => cache.tryGet(url, () => ofetch(url, { headers: { Cookie: cookie } }))));

                let description = '';
                for (const winner of winners) {
                    const content = load(winner);
                    const image = content('.featured-photo').html() ?? '';
                    const column = content('#tertiary-navigation').parent();

                    content('#tertiary-navigation').remove();

                    description += image + column.html();
                }

                return {
                    description,
                    title: year,
                    link: winnersUrls[0],
                    guid: `${currentUrl}#${year}`,
                };
            })
    );

    return {
        title: 'A.M. Turing Award Winners',
        link: currentUrl,
        item: items,
    };
}
