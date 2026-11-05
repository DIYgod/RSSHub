import InvalidParameterError from '@/errors/types/invalid-parameter';
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
    handler,
    description: `Additional search parameters

| Parameter        | Description          | Default   | Options                                                        |
| ---------------- | -------------------- | --------- | -------------------------------------------------------------- |
| order\\_by        | Sort by              | relevancy | relevancy, date, popularity                                    |
| order\\_direction | Sort order           | desc      | desc, asc                                                      |
| range            | Date range           | all       | all, 1day, 3days, 7days, 30days, 90days, 1year, 3years, 5years |
| pattern          | Query match pattern  | extended  | all, any, extended                                             |
| type             | Category of artworks | all       | art, flash, photo, music, story, poetry                        |`,
};

async function handler(ctx) {
    const { query, mode = 'sfw', routeParams = 'order_by=relevancy' } = ctx.req.param();
    if (!['sfw', 'nsfw'].includes(mode)) {
        throw new InvalidParameterError('mode must be sfw or nsfw.');
    }
    const searchParams = new URLSearchParams(routeParams);
    searchParams.set('q', query);
    searchParams.set('full', '1');
    if (mode === 'nsfw') {
        searchParams.delete('sfw');
    } else {
        searchParams.set('sfw', '1');
    }
    const url = `https://faexport.spangle.org.uk/search.json?${searchParams}`;

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
        // The source API does not provide publication dates.
        author: item.name,
    }));

    return {
        title: 'Fur Affinity | Search',
        link: `https://www.furaffinity.net/search/?q=${encodeURIComponent(query)}`,
        description: 'Fur Affinity Search',
        item: items,
    };
}
