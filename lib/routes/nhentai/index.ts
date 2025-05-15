import { Route } from '@/types';
import cache from '@/utils/cache';
import { getSimple, getDetails, getTorrents } from './util';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const supportedKeys = new Set(['parody', 'character', 'tag', 'artist', 'group', 'language', 'category']);

export const route: Route = {
    path: '/index/:key/:keyword/:mode?',
    example: '/nhentai/index/language/chinese',
    parameters: {
        key: 'Filter term, can be: `parody`, `character`, `tag`, `artist`, `group`, `language` or `category`',
        keyword: 'Filter value',
        mode: 'mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](https://docs.rsshub.app/deploy/config#route-specific-configurations), default to `simple`',
    },
    features: {
        antiCrawler: true,
        supportBT: true,
    },
    radar: [
        {
            source: ['nhentai.net/:key/:keyword'],
            target: '/index/:key/:keyword',
        },
    ],
    name: 'Filter',
    maintainers: ['MegrezZhu', 'hoilc'],
    handler,
};

async function handler(ctx) {
    const { key, keyword, mode } = ctx.req.param();

    if (!supportedKeys.has(key)) {
        throw new InvalidParameterError('Unsupported key');
    }

    const url = `https://nhentai.net/${key}/${keyword.toLowerCase().replace(' ', '-')}/`;

    const simples = await getSimple(url);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 5;
    let items = simples;
    if (mode === 'detail') {
        items = await getDetails(cache, simples, limit);
    } else if (mode === 'torrent') {
        items = await getTorrents(cache, simples, limit);
    }

    return {
        title: `nhentai - ${key} - ${keyword}`,
        link: url,
        description: 'hentai',
        item: items,
    };
}
