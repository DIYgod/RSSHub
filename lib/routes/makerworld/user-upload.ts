import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fetchJson, getNextBuildId } from './utils';

export const route: Route = {
    path: '/user/:handle/upload',
    categories: ['design'],
    example: '/makerworld/user/@Wcad00/upload',
    parameters: {
        handle: 'User handle',
    },
    name: 'User Uploads',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['makerworld.com/:lang/:handle/upload', 'makerworld.com/:lang/:handle'],
        },
    ],
};

async function handler(ctx) {
    const { handle } = ctx.req.param();

    const nextBuildId = await getNextBuildId();
    const response = await fetchJson(`${baseUrl}/_next/data/${nextBuildId}/en/${handle}/upload.json`, { handle });
    const { userInfo, designs } = response.pageProps;

    const items = designs.map((d) => ({
        title: d.title,
        link: `${baseUrl}/en/models/${d.id}-${d.slug}`,
        pubDate: parseDate(d.createTime),
        author: d.designCreator.name,
        category: d.tags,
        description: d.instances.map((i) => `<figure><img src="${i.cover}" alt="${d.title}"><figcaption>${i.title}</figcaption></figure>`).join(''),
    }));

    return {
        title: `${userInfo.name} | Published - MakerWorld`,
        link: `${baseUrl}/en/${handle}/upload`,
        description: userInfo.personal.bio,
        image: userInfo.avatar,
        item: items,
    };
}
