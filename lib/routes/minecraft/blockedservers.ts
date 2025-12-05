import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/blockedservers',
    categories: ['game'],
    example: '/minecraft/blockedservers',
    parameters: {},
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
            source: ['minecraft.net/'],
        },
    ],
    name: 'Java Blocked Servers',
    maintainers: ['xtexChooser'],
    handler,
    url: 'minecraft.net/',
    description: `Java 版中被 Mojang 通过 sessionserver 阻止的服务器域名的 SHA-1 散列`,
    zh: {
        name: 'Java版被阻止的服务器域名散列',
    },
};

async function handler() {
    const response: any = await got({
        method: 'get',
        url: 'https://sessionserver.mojang.com/blockedservers',
    });

    const data = (response.data.toString() as string).split('\n').filter((str) => str !== '');

    const title = `Minecraft Java版被阻止的服务器域名散列`;

    return {
        title,
        link: 'https://sessionserver.mojang.com/blockedservers',
        description: title,
        item: data.map((item) => ({
            title: item,
            description: `域名散列 ${item} 被阻止`,
            guid: item,
        })),
    };
}
