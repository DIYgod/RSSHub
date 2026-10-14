import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/torrents/:imdb_id',
    categories: ['multimedia'],
    example: '/eztv/torrents/6048596',
    parameters: {
        imdb_id: 'The IMDB ID corresponding to the seed of show you want to search can be found on the official website [IMDB](https://www.imdb.com)',
    },
    features: {
        antiCrawler: true,
        supportBT: true,
    },
    name: 'Lookup Torrents by IMDB ID',
    maintainers: ['Songkeys'],
    handler,
};

async function handler(ctx: Context) {
    const imdbId = ctx.req.param('imdb_id');
    if (!imdbId || !/^\d+$/.test(imdbId) || /^0+$/.test(imdbId)) {
        throw new InvalidParameterError('imdb_id must be a positive numeric IMDb ID without the tt prefix, for example 6048596');
    }

    const response = await ofetch('https://eztv.it/api/get-torrents', { query: { imdb_id: imdbId } });

    const torrents = response.torrents_count === 0 ? [] : response.torrents;
    if (torrents.some((item) => !item.torrent_url)) {
        throw new Error('EZTV API returned torrents without torrent_url, so feed item links cannot be populated.');
    }

    return {
        title: `EZTV's Torrents of IMDB ID: ${imdbId}`,
        link: 'https://eztv.it',
        description: `EZTV's Torrents of IMDB ID: ${imdbId}`,
        item: torrents.map((item) => ({
            title: item.title,
            description: `<img src='https:${item.large_screenshot}' />`,
            enclosure_url: item.magnet_url,
            enclosure_type: 'application/x-bittorrent',
            pubDate: parseDate(item.date_released_unix, 'X'),
            link: item.torrent_url,
        })),
    };
}
