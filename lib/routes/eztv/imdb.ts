import type { Context } from 'hono';

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
    const { imdb_id } = ctx.req.param();

    const response = await ofetch(`https://eztv.it/api/get-torrents?imdb_id=${imdb_id}`);

    const torrents = response.torrents_count === 0 ? [] : response.torrents;

    return {
        title: `EZTV's Torrents of IMDB ID: ${imdb_id}`,
        link: 'https://eztv.it',
        description: `EZTV's Torrents of IMDB ID: ${imdb_id}`,
        allowEmpty: true,
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
