import { Route, ViewType } from '@/types';
import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { Podcast, PodcastInfo } from './types';

const handler = async (ctx) => {
    const { id } = ctx.req.param();

    const apiEndpoint = 'https://api.soundon.fm/v2/client';
    const apiToken = 'KilpEMLQeNzxmNBL55u5';

    const podcastInfo = (await cache.tryGet(`soundon:${id}`, async () => {
        const response = await ofetch(`${apiEndpoint}/podcasts/${id}`, {
            headers: {
                'api-token': apiToken,
            },
        });
        return response.data.data;
    })) as PodcastInfo;

    const episodes = (await cache.tryGet(
        `soundon:${id}:episodes`,
        async () => {
            const response = await ofetch(`${apiEndpoint}/podcasts/${id}/episodes`, {
                headers: {
                    'api-token': apiToken,
                },
            });
            return response.data;
        },
        config.cache.routeExpire,
        false
    )) as Podcast[];

    const items = episodes.map(({ data: item }) => ({
        title: item.title,
        description: item.contentEncoded,
        link: item.url,
        author: item.artistName,
        pubDate: parseDate(item.publishDate),
        itunes_item_image: item.cover,
        enclosure_url: item.audioUrl,
        enclosure_type: item.audioType,
        itunes_duration: item.duration,
        category: item.itunesKeywords,
    }));

    return {
        title: podcastInfo.title,
        description: podcastInfo.description,
        itunes_author: podcastInfo.artistName,
        itunes_category: podcastInfo.itunesCategories.join(', '),
        itunes_explicit: podcastInfo.explicit,
        image: podcastInfo.cover,
        language: podcastInfo.language,
        link: podcastInfo.url,
        item: items,
    };
};

export const route: Route = {
    path: '/p/:id',
    categories: ['multimedia'],
    example: '/soundon/p/33a68cdc-18ad-4192-84cc-22bd7fdc6a31',
    parameters: { id: 'Podcast ID' },
    features: {
        supportPodcast: true,
    },
    radar: [
        {
            source: ['player.soundon.fm/p/:id'],
        },
    ],
    name: 'Podcast',
    maintainers: ['TonyRL'],
    view: ViewType.Audios,
    handler,
};
