import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/new',
    categories: ['reading'],
    example: '/literotica/new',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['literotica.com/'],
        },
    ],
    name: 'New Stories',
    maintainers: ['nczitzk'],
    handler,
    url: 'literotica.com/',
};

async function handler() {
    const rootUrl = 'https://www.literotica.com';
    const currentUrl = `${rootUrl}/stories/new_submissions.php`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.b-46t')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.p-48y');

            return {
                title: a.text(),
                link: a.attr('href'),
                category: item.nextAll().eq(3).text().replaceAll(/\(|\)/g, '').trim(),
                pubDate: parseDate(item.nextAll().eq(4).text().trim(), 'MM/DD/YY'),
                author: item
                    .nextAll()
                    .eq(2)
                    .text()
                    .replace(/Submitted by/, '')
                    .trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.aa_ht').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
