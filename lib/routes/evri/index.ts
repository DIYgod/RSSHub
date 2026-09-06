import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:tracking',
    categories: ['other'],
    example: '/evri/H04AQA0004726589',
    parameters: { tracking: 'Tracking number' },
    radar: [
        {
            source: ['www.evri.com/track/parcel/:tracking/details'],
            target: '/:tracking',
        },
    ],
    name: 'Parcel Tracking',
    maintainers: ['HenryQW'],
    handler,
    url: 'www.evri.com/track-a-parcel',
};

async function handler(ctx: Context) {
    const { tracking } = ctx.req.param();
    const link = `https://www.evri.com/track/parcel/${tracking}/details`;
    const apiUrl = 'https://tracking.platform-apis.evri.com/v1';
    const apikey = '0DExZiK9in2ihGce7cDPrnpQ4s4nIpWG';

    const { parcelIdentifiers } = await ofetch(`${apiUrl}/parcels/reference/${tracking}`, {
        headers: {
            apikey,
        },
    });

    if (!parcelIdentifiers?.length) {
        throw new Error(`No parcel found for tracking number ${tracking}`);
    }

    const { results } = await ofetch(`${apiUrl}/parcels`, {
        query: {
            uniqueIds: parcelIdentifiers[0].urn,
        },
        headers: {
            apikey,
        },
    });

    const items = results.flatMap((result) =>
        result.trackingEvents.map((event) => ({
            title: event.trackingPoint.description,
            description: event.trackingStage.description,
            pubDate: parseDate(event.dateTime),
            guid: `evri:${tracking}:${event.dateTime}`,
            link,
        }))
    );

    return {
        title: `Evri Tracking ${tracking}`,
        link,
        item: items,
    };
}
