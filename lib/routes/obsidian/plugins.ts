import { Route } from '@/types';

import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/plugins',
    name: 'Obsidian Plugins',
    maintainers: ['DIYgod'],
    categories: ['program-update'],
    example: '/obsidian/plugins',
    handler,
};

async function handler() {
    const data = JSON.parse(await ofetch('https://raw.githubusercontent.com/obsidianmd/obsidian-releases/refs/heads/master/community-plugins.json')) as {
        id: string;
        name: string;
        author: string;
        description: string;
        repo: string;
    }[];
    const stats = JSON.parse(await ofetch('https://raw.githubusercontent.com/obsidianmd/obsidian-releases/HEAD/community-plugin-stats.json')) as {
        [key: string]: {
            downloads: number;
            updated: number;
        };
    };

    return {
        title: 'Obsidian Plugins',
        link: `https://obsidian.md/plugins`,
        item: data.map((item) => ({
            title: item.name,
            description: `${item.description}<br><br>Downloads: ${stats[item.id].downloads}`,
            link: `https://github.com/${item.repo}`,
            guid: item.id,
            pubDate: new Date(stats[item.id].updated),
            author: item.author,
        })),
    };
}
