import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/games',
    categories: ['game'],
    example: '/speedrun/games',
    name: 'New games',
    maintainers: ['DIYgod'],
    radar: [{ source: ['speedrun.com/games'], target: '/games' }],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.speedrun.com/api/v1/games', {
        query: { orderby: 'created', direction: 'desc', max: 20 },
    });
    return {
        title: 'Speedrun.com - New games',
        link: 'https://www.speedrun.com/games',
        item: response.data.map((game) => ({
            title: game.names.international,
            link: game.weblink,
            pubDate: game.created ? parseDate(game.created) : undefined,
            description: renderToString(<>{game.assets['cover-large']?.uri && <img src={game.assets['cover-large'].uri} alt="" />}</>),
        })),
    };
}
