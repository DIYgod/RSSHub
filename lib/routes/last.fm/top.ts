import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/top/:country?',
    categories: ['multimedia'],
    example: '/last.fm/top/spain',
    parameters: {
        country: '国家或地区, 需要符合`ISO 3166-1`的英文全称, 可参考`https://zh.wikipedia.org/wiki/ISO_3166-1二位字母代码#正式分配代码`',
    },
    features: {
        requireConfig: [
            {
                name: 'LASTFM_API_KEY',
                optional: false,
                description: 'Last.fm API key',
            },
        ],
    },
    radar: [
        {
            source: ['www.last.fm/charts'],
            target: '/top',
        },
    ],
    name: '站内 Top 榜单',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    if (!config.lastfm?.api_key) {
        throw new ConfigNotFoundError('Last.fm RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { country } = ctx.req.param();
    const apiKey = config.lastfm.api_key;

    const data = await ofetch(`https://ws.audioscrobbler.com/2.0/?method=${country ? 'geo.gettoptracks' : 'chart.gettoptracks'}${country ? `&country=${country}` : ''}&api_key=${apiKey}&format=json`);
    const list = data.tracks.track;

    return {
        title: `Top Tracks${country ? ` in ${data.tracks['@attr'].country}` : ''} - Last.fm`,
        link: 'https://www.last.fm/charts#top-tracks',
        item: list.map((item) => ({
            title: `${item.name} - ${item.artist.name}`,
            author: item.artist.name,
            description: `<img src="${item.image.at(-1)['#text']}" />`,
            link: item.url,
        })),
    };
}
