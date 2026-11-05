import { createHash } from 'node:crypto';

import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const categories = {
    overall: 'Overall',
    coding: 'Coding',
    'longer-query': 'Longer Query',
    english: 'English',
    chinese: 'Chinese',
    'hard-prompts': 'Hard Prompts',
};

export const route: Route = {
    path: '/leaderboard/:category?',
    categories: ['programming'],
    example: '/arena/leaderboard',
    parameters: {
        category: {
            description: 'Text leaderboard category.',
            default: 'overall',
            options: Object.entries(categories).map(([value, label]) => ({ value, label })),
        },
    },
    name: 'Text leaderboard updates',
    maintainers: ['DIYgod'],
    description:
        'Each feed contains one complete leaderboard snapshot. The GUID changes when the rankings or scores change, so readers can notify on leaderboard updates. Uses the current Arena website, which replaced chat.lmsys.org.',
    radar: [{ source: ['arena.ai/leaderboard/text'], target: '/leaderboard' }],
    handler,
};

function getLeaderboard($) {
    const flight = $('script')
        .toArray()
        .flatMap((element) => {
            const match = $(element)
                .text()
                .match(/self\.__next_f\.push\((.+)\)/s);
            if (!match) {
                return [];
            }
            const chunk = JSON.parse(match[1]);
            return chunk[0] === 1 && typeof chunk[1] === 'string' ? [chunk[1]] : [];
        })
        .join('');
    for (const line of flight.split('\n')) {
        const match = line.match(/^[0-9a-f]+:(\[.*)$/);
        if (!match) {
            continue;
        }
        const row = JSON.parse(match[1]);
        if (row[3]?.leaderboard?.entries) {
            return row[3].leaderboard;
        }
    }
    throw new Error('Arena did not include its public leaderboard in the page.');
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'overall';
    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError(`Unknown leaderboard category. Supported: ${Object.keys(categories).join(', ')}.`);
    }
    const link = `https://arena.ai/leaderboard/text${category === 'overall' ? '' : `/${category}`}`;
    const response = await ofetch(link);
    const $ = load(response);
    const leaderboard = getLeaderboard($);
    if (leaderboard.leaderboardSlug !== category || !leaderboard.entries.length) {
        throw new Error(`Arena did not return the requested ${category} leaderboard.`);
    }
    const modified = $('script[type="application/ld+json"]')
        .toArray()
        .map((element) => JSON.parse($(element).text()))
        .find((entry) => entry['@type'] === 'WebPage')?.dateModified;
    const snapshot = leaderboard.entries.map((entry) => [entry.rank, entry.modelKey, entry.rating]);
    const hash = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
    return {
        title: `Arena - ${categories[category]} text leaderboard`,
        link,
        item: [
            {
                title: `${categories[category]} text leaderboard`,
                link,
                guid: `${link}#${hash}`,
                pubDate: modified ? parseDate(modified) : undefined,
                description: renderToString(
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Model</th>
                                <th>Score</th>
                                <th>Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.entries.map((entry) => (
                                <tr>
                                    <td>{entry.rank}</td>
                                    <td>{entry.modelUrl ? <a href={entry.modelUrl}>{entry.modelDisplayName}</a> : entry.modelDisplayName}</td>
                                    <td>{entry.rating.toFixed(1)}</td>
                                    <td>{entry.votes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ),
            },
        ],
    };
}
