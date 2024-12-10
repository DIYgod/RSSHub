import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/health/blog',
    categories: ['new-media', 'popular'],
    example: '/harvard/health/blog',
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
            source: ['www.health.harvard.edu/blog'],
        },
    ],
    name: 'Health Blog',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.health.harvard.edu/blog',
};

async function handler() {
    const rootUrl = 'https://www.health.harvard.edu';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $(String.raw`.lg\:text-2xl`)
        .toArray()
        .map((item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
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

                const ldJson = JSON.parse(content('script[type="application/ld+json"]').text())['@graph'].find((i) => i['@type'] === 'Article');

                item.description = content('.content-repository-content').html();
                item.pubDate = parseDate(ldJson.datePublished);
                item.author = ldJson.author.name;

                return item;
            })
        )
    );

    return {
        title: 'Harvard Health Blog',
        link: currentUrl,
        item: items,
    };
}
