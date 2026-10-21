import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import { getRelease } from './utils';

export const route: Route = {
    path: '/artist/:artist',
    categories: ['multimedia'],
    example: '/bandcamp/artist/radiohead',
    parameters: { artist: 'Subdomain of the artist or label, such as `radiohead` in `https://radiohead.bandcamp.com`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Artist Releases',
    maintainers: ['pseudoyu'],
    handler,
    description:
        'Releases on the music page of an artist or label, in the order the page shows them (newest first unless the artist reorders them). Returns the latest 10 by default, use `limit` for more. Artists on a custom domain still have a bandcamp.com subdomain.',
};

async function handler(ctx) {
    const artist = ctx.req.param('artist');
    if (!/^[\da-z-]+$/i.test(artist)) {
        throw new InvalidParameterError('Use the artist subdomain, such as radiohead in https://radiohead.bandcamp.com.');
    }
    const limit = getRouteLimit(ctx, 10);
    const link = `https://${artist}.bandcamp.com/music`;
    const response = await got(link);
    const $ = load(response.data);

    // The grid renders the first releases, and the page adds the rest from data-client-items
    const clientItems: Array<{ page_url: string }> = JSON.parse($('#music-grid').attr('data-client-items') ?? '[]');
    const urls = [
        ...$('#music-grid li a')
            .toArray()
            .map((element) => $(element).attr('href')!),
        ...clientItems.map((item) => item.page_url),
    ];

    const items = await pMap(
        urls.slice(0, limit),
        async (url) => {
            const itemLink = new URL(url, link).href;
            return { ...(await getRelease(itemLink)), link: itemLink };
        },
        { concurrency: 3 }
    );

    return {
        title: `${JSON.parse($('[data-band]').attr('data-band') ?? '{}').name ?? artist} - Bandcamp`,
        link,
        item: items,
        allowEmpty: true,
    };
}
