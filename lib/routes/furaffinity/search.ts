import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/search/:query/:mode?/:routeParams?',
    name: 'Search',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/search/protogen/nsfw',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: {
        query: 'Query value',
        mode: 'R18 content toggle, default value is sfw, options are sfw, nsfw',
        routeParams: 'Additional search parameters',
    },
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
            source: ['furaffinity.net'],
            target: '/search',
        },
    ],
    handler,
    description: `Additional search parameters
| Parameter       | Description          | Default   | Options                                                        |
|-----------------|----------------------|-----------|----------------------------------------------------------------|
| order_by        | Sort by              | relevancy | relevancy, date, popularity                                    |
| order_direction | Sort order           | desc      | desc, asc                                                      |
| range           | Date range           | all       | all, 1day, 3days, 7days, 30days, 90days, 1year, 3years, 5years |
| pattern         | Query match pattern  | extended  | all, any, extended                                             |
| type            | Category of artworks | all       | art, flash, photo, music, story, poetry                        |
`,
};

async function handler(ctx) {
    const { query, mode = 'sfw', routeParams = 'order_by=relevancy' } = ctx.req.param();
    let url = `https://faexport.spangle.org.uk/search.json?sfw=1&full=1&q=${query}&${routeParams}`;
    if (mode === 'nsfw') {
        url = `https://faexport.spangle.org.uk/search.json?full=1&q=${query}&${routeParams}`;
    }

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        allowEmpty: true,
        title: 'Fur Affinity | Search',
        link: `https://www.furaffinity.net/Search/?q=${query}`,
        description: `Fur Affinity Search`,
        item: items,
    };
}
