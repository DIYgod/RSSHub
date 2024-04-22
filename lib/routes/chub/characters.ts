import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/characters',
    categories: ['new-media'],
    example: '/chub/characters',
    name: 'Characters',
    maintainers: ['flameleaf'],
    handler,
};


async function handler() {
    const host = 'https://www.chub.ai/characters';
    const url = `https://api.chub.ai/api/characters/search?query=&first=200&page=1&sort=last_activity_at&asc=false&include_forks=false&nsfw=true&nsfl=true&nsfw_only=false&require_images=false&require_example_dialogues=false&require_alternate_greetings=false&require_custom_prompt=false&exclude_mine=false&venus=true&chub=true&min_tokens=50&require_expressions=false&require_lore=false&mine_first=false&require_lore_embedded=false&require_lore_linked=false&inclusive_or=false&recommended_verified=false`;
    const headers = { Accept: 'application/json' };
    const response = await got({
        method: 'get',
        url,
        headers,
    });
    const data = response.data;
    const nodes = data.nodes;

    return {
        allowEmpty: true,
        title: 'Chub',
        link: host,
        item: nodes
            .map((item) => ({
                    title: item.name,
                    description: `${item.tagline}<br><br>${item.description}`,
                    pubDate: parseDate(item.createdAt),
                    updated: parseDate(item.lastActivityAt),
                    link: `${host}/${item.fullPath}`,
                    author: String(item.fullPath.split('/', 1)),
                    enclosure_url: item.avatar_url,
                    enclosure_type: `image/webp`,
                    category: item.topics,
            })),
    };
}


