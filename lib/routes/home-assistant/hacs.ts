import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hacs/repositories',
    name: 'HACS Repositories',
    maintainers: ['DIYgod'],
    categories: ['program-update'],
    example: '/home-assistant/hacs/repositories',
    handler,
};

interface HacsRepository {
    manifest: {
        name: string;
    };
    manifest_name: string;
    description: string;
    full_name: string;
    domain: string;
    stargazers_count: number;
    topics?: string[];
    last_updated: string;
    last_fetched: number;
}

async function handler() {
    const sections = ['appdaemon', 'integration', 'theme', 'python_script', 'plugin'];
    const dataList = (
        await Promise.all(
            sections.map(async (section) => {
                const url = `https://data-v2.hacs.xyz/${section}/data.json`;
                const response = await ofetch<Record<string, HacsRepository>>(url);
                return Object.values(response);
            })
        )
    ).flat();

    return {
        title: 'HACS Repositories',
        link: 'https://www.hacs.xyz/',
        item: dataList.map((item) => ({
            title: item.manifest_name || item.manifest?.name || item.full_name,
            description: `${item.domain ? `<img src="https://brands.home-assistant.io/_/${item.domain}/icon.png" />` : ''}<br>${item.description}<br><br>Stars: ${item.stargazers_count}`,
            link: `https://github.com/${item.full_name}`,
            guid: item.full_name,
            category: item.topics,
            updated: item.last_updated ? parseDate(item.last_updated) : undefined,
        })),
    };
}
