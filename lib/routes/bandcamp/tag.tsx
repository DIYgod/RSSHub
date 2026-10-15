import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import { getRelease } from './utils';

export const route: Route = {
    path: '/tag/:tag?',
    categories: ['multimedia'],
    example: '/bandcamp/tag/united-kingdom',
    parameters: { tag: 'Tag, can be found in URL. All music by default.' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bandcamp.com/tag/:tag', 'bandcamp.com/discover/:tag'],
            target: '/tag/:tag',
        },
        {
            source: ['bandcamp.com/discover'],
            target: '/tag',
        },
    ],
    name: 'Tag',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag') ?? '';
    const limit = getRouteLimit(ctx, 10);

    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/discover${tag ? `/${encodeURIComponent(tag)}` : ''}`;
    const response = await got({
        method: 'post',
        url: `${rootUrl}/api/discover/1/discover_web`,
        json: {
            category_id: 0,
            tag_norm_names: tag ? [tag] : [],
            geoname_id: 0,
            slice: 'top',
            size: Math.min(limit, 40),
            include_result_types: ['a', 's'],
            followed_bands: false,
        },
    });

    const list: Array<{ title: string; link: string; author: string }> = response.data.results.slice(0, limit).map((item) => {
        const link = new URL(item.item_url);
        link.searchParams.delete('from');
        return { title: item.title, link: link.href, author: item.album_artist || item.band_name };
    });

    const items = await pMap(list, async (item) => ({ ...(await getRelease(item.link)), ...item }), { concurrency: 3 });

    return {
        title: `Bandcamp${tag ? ` - ${tag}` : ''}`,
        link: currentUrl,
        item: items,
    };
}
