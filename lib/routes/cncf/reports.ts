import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://www.cncf.io';

export const route: Route = {
    path: '/reports',
    radar: [
        {
            source: ['cncf.io/reports'],
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'cncf.io/reports',
};

async function handler() {
    const url = `${rootURL}/reports/`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('div.report-item')
        .toArray()
        .map((item) => ({
            title: $(item).find('a.report-item__link').attr('title'),
            link: $(item).find('a.report-item__link').attr('href'),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.parseDate = parseDate(content('p.is-style-spaced-uppercase').splice(':')[1]);
                item.description = content('article > div.has-background').html();

                return item;
            })
        )
    );

    return {
        title: `CNCF - Reports`,
        link: url,
        item: items,
    };
}
