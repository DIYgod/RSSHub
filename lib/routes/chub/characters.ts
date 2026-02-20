import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    breaks: true,
    html: true,
    linkify: true,
    typographer: true,
});

export const route: Route = {
    path: '/characters',
    categories: ['new-media'],
    example: '/chub/characters',
    name: 'Characters',
    maintainers: ['flameleaf'],
    handler,
    features: {
        nsfw: true,
    },
};

function convertUndefinedToString(value: any): string {
    return value === undefined ? '' : value.toString();
}

async function handler() {
    const hostURL = 'https://www.chub.ai/characters';
    const apiURL = 'https://api.chub.ai/search';
    const { data } = await ofetch(apiURL, {
        headers: { Accept: 'application/json' },
        query: {
            search: '',
            first: 200,
            page: 1,
            sort: 'last_activity_at',
            asc: 'false',
            include_forks: 'false',
            nsfw: 'true',
            nsfl: 'true',
            nsfw_only: 'false',
            require_images: 'false',
            require_example_dialogues: 'false',
            require_alternate_greetings: 'false',
            require_custom_prompt: 'false',
            exclude_mine: 'false',
            min_tokens: 50,
            require_expressions: 'false',
            require_lore: 'false',
            mine_first: 'false',
            require_lore_embedded: 'false',
            require_lore_linked: 'false',
            inclusive_or: 'false',
            recommended_verified: 'false',
        },
    });
    const nodes = data.nodes;

    return {
        allowEmpty: true,
        title: 'Chub',
        link: hostURL,
        item: nodes.map((item) => ({
            title: item.name,
            description: `<div><img src="${item.avatar_url}" /></div><div>${item.tagline}</div><div>${md.render(convertUndefinedToString(item.description))}</div>`,
            pubDate: parseDate(item.createdAt),
            updated: parseDate(item.lastActivityAt),
            link: `${hostURL}/${item.fullPath}`,
            author: String(item.fullPath.split('/', 1)),
            enclosure_url: item.max_res_url,
            enclosure_type: `image/png`,
            category: item.topics,
        })),
    };
}
