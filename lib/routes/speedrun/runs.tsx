import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/runs/:scope?/:name?',
    categories: ['game'],
    example: '/speedrun/runs/game/ultrakill',
    parameters: {
        scope: 'Optional game or user scope; omit both parameters for all verified runs.',
        name: 'Game abbreviation or player username. Required when scope is game or user.',
    },
    name: 'Verified runs',
    maintainers: ['DIYgod'],
    radar: [
        { source: ['speedrun.com/users/:name'], target: '/runs/user/:name' },
        { source: ['speedrun.com/:name'], target: '/runs/game/:name' },
    ],
    handler,
};

async function handler(ctx) {
    const scope = ctx.req.param('scope');
    const name = ctx.req.param('name');
    if ((scope && !['game', 'user'].includes(scope)) || (scope && !name)) {
        throw new InvalidParameterError('Use /runs, /runs/game/:abbreviation or /runs/user/:username.');
    }
    let subject;
    if (scope) {
        subject = await cache.tryGet(`speedrun:${scope}:${name}`, async () => {
            const response = await ofetch(`https://www.speedrun.com/api/v1/${scope === 'game' ? 'games' : 'users'}`, {
                query: scope === 'game' ? { name } : { lookup: name },
            });
            const match = response.data.find((entry) => (scope === 'game' ? entry.abbreviation : entry.names.international).toLowerCase() === name.toLowerCase());
            if (!match) {
                throw new InvalidParameterError(`No ${scope} found for ${name}.`);
            }
            return match;
        });
    }
    const response = await ofetch('https://www.speedrun.com/api/v1/runs', {
        query: {
            status: 'verified',
            orderby: 'verify-date',
            direction: 'desc',
            max: 20,
            embed: 'game,category,players',
            ...(scope && { [scope]: subject.id }),
        },
    });
    return {
        title: `Speedrun.com - Verified runs${subject ? ` - ${subject.names.international}` : ''}`,
        link: subject?.weblink ?? 'https://www.speedrun.com/',
        item: response.data.map((run) => ({
            title: `${run.game.data.names.international} - ${run.category.data.name} - ${run.times.primary.replace(/^PT/, '').toLowerCase()}`,
            link: run.weblink,
            author: run.players.data.map((player) => player.names?.international ?? player.name).join(', '),
            category: run.category.data.name,
            pubDate: run.status['verify-date'] || run.submitted ? parseDate(run.status['verify-date'] ?? run.submitted) : undefined,
            description: renderToString(
                <>
                    {run.comment && <p style="white-space: pre-wrap">{run.comment}</p>}
                    {run.videos?.links?.map((video) => (
                        <p>
                            <a href={video.uri}>Watch run</a>
                        </p>
                    ))}
                </>
            ),
        })),
    };
}
