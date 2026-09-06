import LZString from 'lz-string';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['anime'],
    example: '/ebb',
    name: '新番連載',
    maintainers: ['Tsuki'],
    handler,
};

async function handler() {
    const url = 'https://ebb.io/_/anime_list';
    const response = await ofetch(url, {
        headers: {
            Referer: url,
        },
    });
    const responseData = JSON.parse(LZString.decompressFromUTF16(response)!);
    const result = responseData.map((item) => ({
        title: item.name_chi,
        link: `https://ebb.io/anime/${item.anime_id}x${item.season_id}`,
        description: `${item.season_title} - ${item.episode_title}`,
        guid: `${item.anime_id}-${item.season_id}-${item.episode_title}`,
    }));

    return { title: 'ebb.io', link: 'https://ebb.io', description: '最新連載', item: result };
}
