import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { toTitleCase } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const platformIds = {
    ps5: '1500000128',
    'xbox-series-x': '1500000129',
    'nintendo-switch-2': '1500000154',
    'nintendo-switch': '1500000124',
    pc: '1500000019',
    mobile: '1500000112',
    'meta-quest': '1500000127',
    ps4: '1500000120',
    'xbox-one': '1500000121',
    'wii-u': '1500000118',
    '3ds': '1500000116',
    'ps-vita': '1500000117',
};

const sorts = {
    date: 'releaseDate',
    metascore: '-metaScore',
    userscore: '-userScore',
};

export const route: Route = {
    path: '/release/:platform/:type?/:sort?',
    categories: ['game'],
    example: '/metacritic/release/nintendo-switch/coming',
    parameters: {
        platform: 'console platform, see below, `all` for every platform',
        type: 'release type, default to `new`',
        sort: 'sorting type, default to `date`',
    },
    description: `Platforms supported:

| PS5 | Xbox Series X | Switch 2          | Switch          | PC | Mobile | Meta Quest | PS4 | Xbox One | Wii U | 3DS | PS Vita |
| --- | ------------- | ----------------- | --------------- | -- | ------ | ---------- | --- | -------- | ----- | --- | ------- |
| ps5 | xbox-series-x | nintendo-switch-2 | nintendo-switch | pc | mobile | meta-quest | ps4 | xbox-one | wii-u | 3ds | ps-vita |

Release types, default to \`new\`:

| New Releases | Coming Soon |
| ------------ | ----------- |
| new          | coming      |

Sorting types, default to \`date\`:

| Date | Metacritic Score | User Score |
| ---- | ---------------- | ---------- |
| date | metascore        | userscore  |`,
    radar: [
        {
            source: ['metacritic.com/browse/game/:platform'],
            target: '/release/:platform',
        },
    ],
    name: 'Game Releases',
    maintainers: ['HenryQW'],
    handler,
};

export async function handler(ctx) {
    const { platform, type = 'new', sort = 'date' } = ctx.req.param();
    if (platform !== 'all' && !Object.hasOwn(platformIds, platform)) {
        throw new InvalidParameterError(`Unknown platform; use all or one of ${Object.keys(platformIds).join(', ')}.`);
    }
    if (!Object.hasOwn(sorts, sort)) {
        throw new InvalidParameterError('Unknown sort; use date, metascore, or userscore.');
    }
    const coming = type === 'coming';
    const limit = Number(ctx.req.query('limit')) || 24;

    const { data } = await got('https://backend.metacritic.com/finder/metacritic/web', {
        searchParams: {
            mcoTypeId: 13,
            limit,
            sortBy: sort === 'date' && !coming ? '-releaseDate' : sorts[sort],
            ...(coming && { releaseType: 'coming-soon' }),
            ...(platform !== 'all' && { gamePlatformIds: platformIds[platform] }),
        },
    });

    const items = data.data.items.map((item) => {
        const metascore = item.criticScoreSummary?.score ?? 'tbd';
        const userscore = item.userScore?.score ?? 'tbd';
        return {
            title: `${metascore === 'tbd' ? '' : `[${metascore}] `}${item.title}`,
            link: `https://www.metacritic.com/game/${item.slug}/`,
            description: [item.image && `<img src="https://www.metacritic.com/a/img/catalog${item.image.bucketPath}">`, item.description, `Metascore: ${metascore} <br> User Score: ${userscore}`].filter(Boolean).join('<br>'),
            pubDate: item.releaseDate ? parseDateInTimezone(item.releaseDate, 0) : undefined,
            category: [...(item.genres ?? []), ...(item.platforms ?? [])].map((c) => c.name),
        };
    });

    return {
        title: toTitleCase(`Metacritic ${platform} games ${coming ? 'Coming Soon' : 'New Releases'}`),
        link: `https://www.metacritic.com/browse/game/${platform}/${coming ? '?releaseType=coming-soon' : ''}`,
        item: items,
    };
}
