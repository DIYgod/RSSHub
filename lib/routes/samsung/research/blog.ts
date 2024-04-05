import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research/blog',
    categories: ['new-media'],
    example: '/samsung/research/blog',
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
            source: ['research.samsung.com/blog', 'research.samsung.com/'],
        },
    ],
    name: 'Research Blog',
    maintainers: ['nczitzk'],
    handler,
    url: 'research.samsung.com/blog',
};

async function handler() {
    const rootUrl = 'https://research.samsung.com';
    const currentUrl = `${rootUrl}/blogMain/list.json`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            currentPageNo: 0,
            endIndex: 9,
            startIndex: 0,
        },
    });

    let items = response.data.value.map((item) => ({
        title: item.title,
        author: item.authorName,
        link: `${rootUrl}${item.urlLink}`,
        category: [item.catagoryCode, item.hashTag1, item.hashTag2],
        pubDate: parseDate(item.publicationDtsStr.replace(/On /, ''), 'MMMM D, YYYY'),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.news-con').html();

                return item;
            })
        )
    );

    return {
        title: 'BLOG | Samsung Research',
        link: `${rootUrl}/blog`,
        item: items,
    };
}
