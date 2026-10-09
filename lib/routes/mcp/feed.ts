import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/feed/:type?',
    categories: ['programming'],
    example: '/mcp/feed',
    parameters: {
        type: {
            description: 'Submission type.',
            default: 'all',
            options: [
                { value: 'all', label: 'All submissions' },
                { value: 'servers', label: 'Servers' },
                { value: 'remote-servers', label: 'Remote servers' },
                { value: 'clients', label: 'Clients' },
            ],
        },
    },
    name: 'New submissions',
    maintainers: ['DIYgod'],
    radar: [{ source: ['mcp.so/feed'], target: '/feed' }],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'all';
    if (!['all', 'servers', 'remote-servers', 'clients'].includes(type)) {
        throw new InvalidParameterError('The submission type must be all, servers, remote-servers or clients.');
    }
    const link = `https://mcp.so/feed${type === 'all' ? '' : `?type=${type}`}`;
    const response = await ofetch(link);
    const $ = load(response);
    const items = $('main a[href^="/servers/"], main a[href^="/clients/"]')
        .toArray()
        .map((element) => {
            const card = $(element);
            const submittedAt = card.find('span[title]').attr('title');
            const image = card.find('img').first();
            const description = card.children('p').first();
            return {
                title: card.find('h3').text(),
                link: new URL(card.attr('href')!, link).href,
                description: `${$.html(image)}${$.html(description)}`,
                author: card.find('h3').parent().next('p').text() || undefined,
                pubDate: submittedAt ? parseDate(`${submittedAt} +0000`, 'MM/DD/YYYY, h:mm A ZZ') : undefined,
            };
        });

    return {
        title: `MCP.so - ${type === 'all' ? 'New submissions' : type}`,
        link,
        item: items,
    };
}
