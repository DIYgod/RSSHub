import { Route } from '@/types';
import { ofetch } from 'ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcast/latest-episodes',
    categories: ['multimedia'],
    example: '/apple/podcast/latest-episodes',
    features: {
        requireConfig: [
            {
                name: 'APPLE_AUTH',
                description:
                    'Apple Authorization. can be found at `https://podcasts.apple.com/us/library/latest-episodes`.Open Developer Tools and navigate to Network tab. locate request `amp-api.podcasts.apple.com/v1/me/library/latest-episodes` and copy Authorization from header',
            },
            {
                name: 'APPLE_COOKIE',
                description:
                    'Apple Cookie. can be found at `https://podcasts.apple.com/us/library/latest-episodes`.Open Developer Tools and navigate to Network tab. locate request `amp-api.podcasts.apple.com/v1/me/library/latest-episodes` and copy Cookie from header',
            },
        ],
    },
    radar: [
        {
            source: ['podcasts.apple.com/us/library/latest-episodes'],
        },
    ],
    name: '播客',
    maintainers: ['EthanWng97'],
    handler,
    url: 'https://podcasts.apple.com/us/library/latest-episodes',
};

async function handler() {
    const link = `https://amp-api.podcasts.apple.com/v1/me/library/latest-episodes`;
    const auth = config.apple.auth;
    const cookie = config.apple.cookie;

    if (!auth || !cookie) {
        throw new ConfigNotFoundError('Either Auth or Cookie is not configured!');
    }
    const data = await ofetch(link, {
        method: 'get',
        headers: {
            Authorization: auth,
            Origin: 'https://podcasts.apple.com',
            Cookie: cookie,
        },
    });

    const episodes = data.data.map((item) => {
        const attr = item.attributes;
        const artworkUrl = attr.artwork.url.replace('{w}', attr.artwork.width).replace('{h}', attr.artwork.height).replace('{f}', 'jpg');

        return {
            title: attr.name,
            link: attr.url,
            pubDate: parseDate(attr.releaseDateTime),
            author: attr.artistName,
            description: attr.description.standard,
            itunes_item_image: artworkUrl,
            enclosure_url: attr.assetUrl,
            enclosure_type: 'audio/mp4',
            itunes_duration: attr.durationInMilliseconds / 1000,
        };
    });

    return {
        title: 'Apple Podcast - Latest Episodes',
        link: 'https://podcasts.apple.com/us/library/latest-episodes',
        itunes_author: 'Apple Podcast',
        item: episodes,
        description: 'Apple Podcast',
    };
}
