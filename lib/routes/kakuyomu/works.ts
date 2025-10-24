import type { Data, DataItem, Route } from '@/types';
import { load } from 'cheerio';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import type { NextDataEpisode } from './types';
import { parseDate } from '@/utils/parse-date';

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
    const limit = Number.parseInt(ctx.req.query('limit') || '10');
    const $ = load(await ofetch(url));

    const nextData = JSON.parse($('#__NEXT_DATA__').text());

    const {
        props: {
            pageProps: { __APOLLO_STATE__ },
        },
    } = nextData;

    const {
        [`Work:${id}`]: { title, catchphrase },
    } = __APOLLO_STATE__;

    const values = Object.values(__APOLLO_STATE__);
    const episodes = values.filter((value) => value.__typename === 'Episode') as NextDataEpisode[];
    const items = (await Promise.all(
        episodes
            .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
            .slice(0, limit)
            .map((item) => {
                const episodeUrl = `https://kakuyomu.jp/works/${id}/episodes/${item.id}`;
                return cache.tryGet(episodeUrl, async () => {
                    const $ = load(await ofetch(episodeUrl));
                    const description = $('.widget-episodeBody').html();
                    return {
                        title: item.title,
                        link: episodeUrl,
                        description,
                        pubDate: parseDate(item.publishedAt),
                        guid: item.id,
                    };
                });
            })
    )) as DataItem[];

    return {
        title,
        link: url,
        description: catchphrase,
        item: items,
    };
}
