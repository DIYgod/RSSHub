import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fetchJson, getNextBuildId } from './utils';

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
    const response = await fetchJson(`${baseUrl}/_next/data/${nextBuildId}/en.json`);

    const items = response.pageProps.v2Props.foryouData.hits
        .filter((hit) => hit.design?.title)
        .map(({ design: d }) => ({
            title: d.title,
            link: `${baseUrl}/en/models/${d.id}-${d.slug}`,
            author: d.designCreator.name,
            pubDate: parseDate(d.createTime),
            description: d.designExtension.design_pictures.map((i) => `<figure><img src="${i.url}" alt="${d.title}"><figcaption>${i.name}</figcaption></figure>`).join(''),
        }));

    return {
        title: 'Trending Models - MakerWorld',
        description: 'Leading 3D printing model community for designers and makers. Download thousands of 3D models and stl models for free, and your No.1 option for multicolor 3D models',
        link: `${baseUrl}/en`,
        image: `${baseUrl}/favicon_new.png`,
        item: items,
    };
}
