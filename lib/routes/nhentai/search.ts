import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getRouteLimit } from '@/utils/route-limit';

import { getDetails, getSimple, getTorrents } from './util';

export const route: Route = {
    path: '/search/:keyword/:mode?',
    example: '/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-"mosaic+censorship"',
    parameters: {
        keyword: 'Keywords for search. You can copy the content after `q=` after searching on the original website, or you can enter it directly. See the [official website](https://nhentai.net/info/) for details',
        mode: 'mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](https://docs.rsshub.app/deploy/config#route-specific-configurations), default to `simple`',
    },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: true,
        nsfw: true,
    },
    radar: [
        {
            source: ['nhentai.net/search/'],
        },
    ],
    name: 'Advanced Search',
    maintainers: ['MegrezZhu', 'hoilc', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const { keyword, mode } = ctx.req.param();

    const url = `https://nhentai.net/search/?q=${keyword}`;

    const simples = await getSimple(url);

    const limit = getRouteLimit(ctx, 5);
    let items = simples;
    if (mode === 'detail') {
        items = await getDetails(cache, simples, limit);
    } else if (mode === 'torrent') {
        items = await getTorrents(cache, simples, limit);
    }

    return {
        title: `nhentai - search - ${keyword}`,
        link: url,
        item: items,
    };
}
