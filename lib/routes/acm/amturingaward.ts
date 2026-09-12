import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/amturingaward',
    categories: ['programming'],
    example: '/acm/amturingaward',
    name: 'A.M.Turing Award Winners',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://amturing.acm.org';
    const currentUrl = `${rootUrl}/byyear.cfm`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

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
                const winners = await Promise.all(winnersUrls.map((url) => ofetch(url)));

                let description = '';
                for (const winner of winners) {
                    const content = load(winner);
                    const image = content('.featured-photo').html() ?? '';
                    const column = content('#tertiary-navigation').parent();

                    content('#tertiary-navigation').remove();

                    description += image + column.html();
                }

                return {
                    pubDate: parseDate(`${year}-12-31`),
                    description,
                    title: year,
                    link: currentUrl,
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
