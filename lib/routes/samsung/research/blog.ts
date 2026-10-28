import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
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

    let items: Array<DataItem & { link: string }> = response.data.value.map((item) => ({
        title: item.title,
        author: item.authorList?.map((author) => ({ name: author.name })) ?? item.authorName,
        link: `${rootUrl}${item.urlLink}`,
        category: [item.catagoryCode, item.hashTag1, item.hashTag2],
        pubDate: item.publicationDtsStr ? parseDate(`${item.publicationDtsStr.replace(/On /, '')} GMT`) : undefined,
    }));

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.news-con').html();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: 'BLOG | Samsung Research',
        link: `${rootUrl}/blog`,
        item: items,
    };
}
