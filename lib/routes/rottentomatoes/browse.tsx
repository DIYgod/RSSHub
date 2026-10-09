import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const lists = {
    'new-in-theaters': { path: 'movies_in_theaters/sort:newest', name: 'New movies in theaters' },
    'popular-in-theaters': { path: 'movies_in_theaters/sort:popular', name: 'Popular movies in theaters' },
    'popular-streaming': { path: 'movies_at_home/sort:popular', name: 'Popular streaming movies' },
    'certified-fresh': { path: 'movies_at_home/critics:certified_fresh', name: 'Certified Fresh movies' },
    'popular-tv': { path: 'tv_series_browse/sort:popular', name: 'Popular TV shows' },
    'new-tv': { path: 'tv_series_browse/sort:newest', name: 'New TV shows' },
};

export const route: Route = {
    path: '/browse/:list?',
    categories: ['multimedia'],
    example: '/rottentomatoes/browse',
    parameters: {
        list: {
            description: 'Movie or TV list.',
            default: 'new-in-theaters',
            options: Object.entries(lists).map(([value, list]) => ({ value, label: list.name })),
        },
    },
    name: 'Movie and TV lists',
    maintainers: ['DIYgod'],
    radar: [{ source: ['rottentomatoes.com/browse'], target: '/browse' }],
    handler,
};

async function handler(ctx) {
    const list = ctx.req.param('list') ?? 'new-in-theaters';
    if (!Object.hasOwn(lists, list)) {
        throw new InvalidParameterError(`Unknown list. Supported lists: ${Object.keys(lists).join(', ')}.`);
    }
    const selectedList = lists[list];
    const response = await ofetch(`https://www.rottentomatoes.com/cnapi/browse/${selectedList.path}`);
    return {
        title: `Rotten Tomatoes - ${selectedList.name}`,
        link: `https://www.rottentomatoes.com/browse/${selectedList.path}`,
        item: response.grid.list.map((item) => {
            const releaseDate = item.releaseDateText?.match(/[A-Z][a-z]{2} \d{2}, \d{4}/)?.[0];
            return {
                title: item.title,
                link: new URL(item.mediaUrl, 'https://www.rottentomatoes.com').href,
                pubDate: releaseDate ? parseDate(releaseDate, 'MMM DD, YYYY', 'en') : undefined,
                description: renderToString(
                    <>
                        {item.posterUri && <img src={item.posterUri} alt="" />}
                        {item.criticsScore.scorePercent && <p>Tomatometer: {item.criticsScore.scorePercent}</p>}
                        {item.audienceScore.scorePercent && <p>Popcornmeter: {item.audienceScore.scorePercent}</p>}
                    </>
                ),
            };
        }),
    };
}
