import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/events',
    name: 'Link3 Events',
    url: 'link3.to',
    maintainers: ['cxheng315'],
    example: '/link3/events',
    categories: ['other'],
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
            source: ['link3.to/events'],
            target: '/events',
        },
    ],
    handler,
};

async function handler() {
    const url = 'https://api.cyberconnect.dev/profile/';

    const response = await ofetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            variables: {
                order: 'START_TIME_ASC',
            },
            query: `
                query getTrendingEvents($first: Int, $after: String, $order: TrendingEventsRequest_EventOrder, $filter: TrendingEventsRequest_EventFilter) {
                    trendingEvents(first: $first, after: $after, order: $order, filter: $filter) {
                        list {
                            id
                            info
                            title
                            posterUrl
                            startTimestamp
                            endTimestamp
                            organizer {
                                lightInfo {
                                    displayName
                                    profilePicture
                                    profileHandle
                                }
                            }
                        }
                    }
                }
            
            `,
        },
    });

    const items = response.data.trendingEvents.list.map((event) => ({
        title: event.title,
        link: `https://link3.to/e/${event.id}`,
        description: event.info ?? '',
        author: event.organizer.lightInfo.displayName,
        guid: event.id,
        pubDate: parseDate(event.startTimestamp * 1000),
        itunes_item_image: event.posterUrl,
        itunes_duration: event.endTimestamp - event.startTimestamp,
    }));

    return {
        title: 'Link3 Events',
        link: 'https://link3.to/events',
        description: 'Link3 is a Web3 native social platform built on CyberConnect protocol.',
        image: 'https://link3.to/logo.svg',
        logo: 'https://link3.to/logo.svg',
        author: 'Link3',
        item: items,
    };
}
