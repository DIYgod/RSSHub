import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/live',
    categories: ['multimedia'],
    example: '/bandcamp/live',
    parameters: {},
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
            source: ['bandcamp.com/live_schedule', 'bandcamp.com/live'],
        },
    ],
    name: 'Upcoming Live Events',
    maintainers: ['nczitzk'],
    handler,
    url: 'bandcamp.com/live',
};

async function handler() {
    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/live`;
    const limit = 20;
    const response = await got({
        method: 'post',
        url: `${rootUrl}/api/live_events_public_api/4/get_upcoming_live_events`,
        json: { page_size: Math.min(limit, 20) },
    });

    const items = response.data.items.map((item) => {
        const image = item.imageId ? `https://f4.bcbits.com/img/${item.isArt ? `a${String(item.imageId).padStart(10, '0')}_2.jpg` : `${item.imageId}_4x3t_500.webp`}` : undefined;
        return {
            link: item.liveEventUrl,
            title: item.title,
            author: item.artist,
            pubDate: item.scheduledStartDate ? parseDate(item.scheduledStartDate) : undefined,
            image,
            description: renderToString(
                <>
                    {image ? <img src={image} /> : null}
                    <p style="white-space: pre-line">{item.description}</p>
                </>
            ),
        };
    });

    return {
        title: 'Upcoming Live Events | Bandcamp',
        link: currentUrl,
        item: items,
    };
}
