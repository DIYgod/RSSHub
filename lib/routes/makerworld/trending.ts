import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, getNextBuildId } from './utils';

export const route: Route = {
    path: '/trending',
    categories: ['design'],
    example: '/makerworld/trending',
    name: 'Trending Models',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['makerworld.com/:lang'],
        },
    ],
};

async function handler() {
    const nextBuildId = await getNextBuildId();
    const response = await ofetch(`${baseUrl}/_next/data/${nextBuildId}/en.json`, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const items = response.pageProps.popularDesignsData.map((d) => ({
        title: d.title,
        link: `${baseUrl}/en/models/${d.id}-${d.slug}`,
        author: d.designCreator.name,
        category: d.tags,
        pubDate: parseDate(d.startTime),
        description: d.designExtension.design_pictures.map((i) => `<figure><img src="${i.url}" alt="${d.name}"><figcaption>${i.name}</figcaption></figure>`).join(''),
    }));

    return {
        title: 'Trending Models - MakerWorld',
        description: 'Leading 3D printing model community for designers and makers. Download thousands of 3D models and stl models for free, and your No.1 option for multicolor 3D models',
        link: `${baseUrl}/en`,
        image: `${baseUrl}/favicon_new.png`,
        item: items,
    };
}
