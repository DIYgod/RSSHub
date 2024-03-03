// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const link = 'https://wallpaperhub.app/api/v1/wallpapers/?limit=20&page=&query=&width=&height=&tags=';
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.entities.map((item) => ({
        title: item.entity.title,
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: item.entity.description,
            img: item.entity.variations[0].resolutions[0].url || item.entity.thumbnail,
        }),
        pubDate: parseDate(item.entity.created),
        link: `https://wallpaperhub.app/wallpapers/${item.entity.id}`,
    }));

    ctx.set('data', {
        title: 'WallpaperHub',
        link: 'https://wallpaperhub.app/wallpapers',
        item: list,
    });
};
