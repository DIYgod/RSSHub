import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/asia',
    categories: ['traditional-media'],
    example: '/nikkei/asia',
    radar: [
        {
            source: ['asia.nikkei.com/'],
        },
    ],
    name: 'Nikkei Asia Latest News',
    maintainers: ['rainrdx'],
    handler,
    url: 'asia.nikkei.com',
};

async function handler() {
    const currentUrl = 'https://asia.nikkei.com/api/__service/next_api/v1/graphql';

    const response = await got({
        method: 'get',
        url: currentUrl,
        searchParams: {
            operationName: 'GetLatestHeadlinesStream',
            variables: '{}',
            extensions: '{"persistedQuery":{"version":1,"sha256Hash":"287aed8784a3f55ad444bb6b550ebdafb40b0da60c7800081e7343d889975fe8"}}',
        },
        headers: {
            'content-type': 'application/json',
        },
    });

    const list = response.data.data.getLatestHeadlines.items.map((item) => ({ ...item, link: new URL(item.path, 'https://asia.nikkei.com').pathname }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {

                item.pubDate = parseDate(item.displayDate*1000);
                item.category = item.primaryTag.name;
                return item;
            })
        )
    );

    return {
        title: 'Nikkei Asia',
        link: 'https://asia.nikkei.com',
        image: 'https://main-asianreview-nikkei.content.pugpig.com/pugpig_assets/admin/pub120x120.jpg',
        item: items,
    };
}
