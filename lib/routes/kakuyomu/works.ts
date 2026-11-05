import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import type { NextDataEpisode } from './types';

export const route: Route = {
    name: '投稿',
    categories: ['reading'],
    path: '/works/:id',
    example: '/kakuyomu/works/1177354054894027232',
    parameters: {
        id: '投稿 ID',
    },
    maintainers: ['KarasuShin'],
    handler,
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['kakuyomu.jp/works/:id'],
            target: '/works/:id',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const id = ctx.req.param('id');
    const url = `https://kakuyomu.jp/works/${id}`;
    const limit = getRouteLimit(ctx, 10);
    const html = await ofetch(url);
    const $ = load(html);

    const nextData = JSON.parse($('#__NEXT_DATA__').text());

    const {
        props: { pageProps },
    } = nextData;
    const { __APOLLO_STATE__: apolloState } = pageProps;

    const { title, catchphrase } = apolloState[`Work:${id}`];

    const values = Object.values<{ __typename: string }>(apolloState);
    const episodes = values.filter((value): value is NextDataEpisode => value.__typename === 'Episode');
    const items = await pMap(
        (ctx.req.query('sorted') === 'false' ? episodes : episodes.toSorted((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))).slice(0, limit),
        async (item) => {
            const episodeUrl = `https://kakuyomu.jp/works/${id}/episodes/${item.id}`;
            const description = await cache.tryGet(`kakuyomu:body:${episodeUrl}`, async () => {
                const html = await ofetch(episodeUrl);
                const $ = load(html);
                const description = $('.widget-episodeBody').html();
                return description;
            });
            return {
                title: item.title,
                link: episodeUrl,
                description,
                pubDate: item.publishedAt ? parseDate(item.publishedAt) : undefined,
                guid: item.id,
            };
        },
        { concurrency: 3 }
    );

    return {
        title,
        link: url,
        description: catchphrase,
        language: 'ja',
        item: items,
    };
}
