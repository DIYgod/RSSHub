import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:url',
    name: 'Events',
    url: 'lu.ma',
    maintainers: ['cxheng315'],
    example: '/luma/yieldnest',
    categories: ['other'],
    parameters: {
        url: 'LuMa URL',
    },
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
            source: ['lu.ma/:url'],
            target: '/:url',
        },
    ],
    handler,
};

async function handler(ctx) {
    const endpoint = 'https://api.lu.ma/url?url=' + ctx.req.param('url');

    const response = await ofetch(endpoint);

    let items;

    switch (response.kind) {
        case 'calendar':
            items = response.data.featured_items.map((item) => ({
                title: item.event.name,
                link: 'https://lu.ma/' + item.event.url,
                author: item.hosts ? item.hosts.map((host) => host.name).join(', ') : '',
                guid: item.event.api_id,
                pubDate: parseDate(item.event.start_at),
                itunes_item_image: item.event.cover_url,
                itunes_duration: (new Date(item.event.end_at).getTime() - new Date(item.event.start_at).getTime()) / 1000,
            }));
            break;
        case 'event':
            items = [
                {
                    title: response.data.event.name,
                    link: 'https://lu.ma/' + response.data.event.url,
                    author: response.data.hosts ? response.data.hosts.map((host) => host.name).join(', ') : '',
                    guid: response.data.event.api_id,
                    pubDate: parseDate(response.data.event.start_at),
                    itunes_item_image: response.data.event.cover_url,
                    itunes_duration: (new Date(response.data.event.end_at).getTime() - new Date(response.data.event.start_at).getTime()) / 1000,
                },
            ];
            break;
        case 'discover-place':
            items = response.data.events.map((item) => ({
                title: item.event.name,
                link: 'https://lu.ma/' + item.event.url,
                author: item.hosts ? item.hosts.map((host) => host.name).join(', ') : '',
                guid: item.event.api_id,
                pubDate: parseDate(item.event.start_at),
                itunes_item_image: item.event.cover_url,
                itunes_duration: (new Date(item.event.end_at).getTime() - new Date(item.event.start_at).getTime()) / 1000,
            }));
            break;
        default:
            items = [
                {
                    title: 'Not Found',
                    link: 'Not Found',
                },
            ];
            break;
    }

    return {
        title: response.data.calendar ? response.data.calendar.name : response.data.place.name,
        description: response.data.place ? response.data.place.description : '',
        link: 'https://lu.ma/' + ctx.req.param('url'),
        image: response.data.calendar ? response.data.calendar.cover_url : response.data.place.cover_url,
        item: items,
    };
}
