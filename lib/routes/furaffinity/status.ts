import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/status',
    name: 'Status',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/status',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['furaffinity.net'],
            target: '/status',
        },
    ],
    handler,
};

async function handler() {
    const url = 'https://faexport.spangle.org.uk/status.json';

    let data;
    try {
        data = await ofetch(url, {
            method: 'GET',
            headers: {
                Referer: 'https://faexport.spangle.org.uk/',
            },
        });
    } catch (error) {
        if (!(error instanceof FetchError) || !error.statusCode || error.statusCode < 500) {
            throw error;
        }
        const html = await ofetch('https://www.furaffinity.net/', { responseType: 'text' });
        const $ = load(html);
        const counts = $('.online-stats')
            .text()
            .replaceAll(/\s+/g, ' ')
            .trim()
            .match(/^(\d+) Users online\D+(\d+) guests, (\d+) registered and (\d+) other/);
        if (!counts) {
            throw new Error('Fur Affinity did not return its public online user counts.', { cause: error });
        }
        data = {
            online: { total: Number(counts[1]), guests: Number(counts[2]), registered: Number(counts[3]), other: Number(counts[4]) },
            fa_server_time: $('.footnote').text().split('Server Time:', 2)[1]?.split('Page generated', 1)[0].trim(),
        };
    }

    const description = data.online
        ? `Status: FA Server Online <br> Guests: ${data.online.guests} <br> Registered: ${data.online.registered} <br> Other: ${data.online.other} <br> Total: ${data.online.total}${data.fa_server_time ? ` <br> FA Server Time: ${data.fa_server_time}` : ''}${data.fa_server_time_at ? ` <br> FA Server Time at: ${data.fa_server_time_at}` : ''}`
        : 'FA Server Offline';

    const items: Array<{ title: string; link: string; description: string }> = [
        {
            title: `Status: ${data.online ? 'online' : 'offline'}`,
            link: 'https://www.furaffinity.net/',
            description,
        },
    ];

    return {
        title: 'Fur Affinity | Status',
        link: 'https://www.furaffinity.net/',
        description: 'Fur Affinity Status',
        item: items,
    };
}
