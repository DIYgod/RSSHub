import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/wallpaperhub',
    radar: [
        {
            source: ['wallpaperhub.app/wallpapers', 'wallpaperhub.app/'],
            target: '',
        },
    ],
    name: 'Wallpapers',
    maintainers: ['nczitzk'],
    handler,
    url: 'wallpaperhub.app/wallpapers',
};

function parseSourceTime(value?: string | number) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler() {
    const link = 'https://wallpaperhub.app/api/v1/wallpapers/?limit=20&page=&query=&width=&height=&tags=';
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.entities.map((item) => {
        const imageUrl = item.entity.variations?.[0]?.resolutions?.[0]?.url || item.entity.thumbnail;
        return {
            title: item.entity.title,
            description: renderToString(
                <>
                    <p>{item.entity.description}</p>
                    {imageUrl ? <img src={imageUrl} /> : null}
                </>
            ),
            pubDate: parseSourceTime(item.entity.created),
            category: item.entity.tags,
            link: `https://wallpaperhub.app/wallpapers/${item.entity.id}`,
        };
    });

    return {
        title: 'WallpaperHub',
        link: 'https://wallpaperhub.app/wallpapers',
        item: list,
    };
}
