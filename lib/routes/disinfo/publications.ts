import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/publications',
    categories: ['new-media'],
    example: '/disinfo/publications',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['disinfo.eu/'],
        },
    ],
    name: 'Publications',
    maintainers: ['nczitzk'],
    handler,
    url: 'disinfo.eu/',
};

async function handler() {
    const rootUrl = 'https://www.disinfo.eu';
    const currentUrl = `${rootUrl}/publications`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const publications = await ofetch<Array<{ link: string; date_gmt: string; modified_gmt: string }>>(`${rootUrl}/wp-json/wp/v2/publication`, { query: { per_page: 12, _fields: 'link,date_gmt,modified_gmt' } });
    const publicationDates = new Map(publications.map((publication) => [publication.link, publication]));

    const list = $('.elementor-heading-title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const publication = publicationDates.get($item.attr('href')!);

            return {
                title: $item.text(),
                link: $item.attr('href'),
                pubDate: publication?.date_gmt ? parseDate(`${publication.date_gmt}Z`) : undefined,
                updated: publication?.modified_gmt ? parseDate(`${publication.modified_gmt}Z`) : undefined,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.wp-block-spacer').remove();

                content('img').each((_, el) => {
                    content(el).attr('src', content(el).attr('data-lazy-src'));
                });

                item.description = content('.elementor-widget-theme-post-content').html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
