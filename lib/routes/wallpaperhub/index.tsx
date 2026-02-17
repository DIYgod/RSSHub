import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['wallpaperhub.app/wallpaperhub', 'wallpaperhub.app/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'wallpaperhub.app/wallpaperhub',
};

async function handler() {
    const link = 'https://wallpaperhub.app/api/v1/wallpapers/?limit=20&page=&query=&width=&height=&tags=';
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.entities.map((item) => ({
        title: item.entity.title,
        description: renderToString(
            <>
                <p>{item.entity.description}</p>
                <img src={item.entity.variations[0].resolutions[0].url || item.entity.thumbnail} />
            </>
        ),
        pubDate: parseDate(item.entity.created),
        link: `https://wallpaperhub.app/wallpapers/${item.entity.id}`,
    }));

    return {
        title: 'WallpaperHub',
        link: 'https://wallpaperhub.app/wallpapers',
        item: list,
    };
}
