import type { Route, Data, DataItem } from '@/types'; // Consolidated imports
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import dayjs from 'dayjs';

export const route: Route = {
    path: '/:eventType?/:region',
    categories: ['programming'],
    example: '/eventbrite/all-events/canada--toronto',
    parameters: { evenType: 'category of events for filtering', region: 'Region or scope of events' },
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
            source: ['eventbrite.com/d/:region/:eventType', 'eventbrite.ca/d/:region/*eventType'],
            target: '/:eventType/:region',
        },
    ],
    name: 'Events',
    maintainers: ['elibroftw'],
    handler: async (ctx: Context): Promise<Data> => {
        const params = ctx.req.param();
        const { region } = params;
        let eventType = params.eventType || 'all-events';
        if (eventType === 'events') {
            eventType = 'all-events';
        }
        const link = `https://eventbrite.com/d/${region}/${eventType}/`;
        const response = await ofetch(link);
        const $ = load(response);
        const startTime = dayjs();
        const items = $('div.search-results-panel-content section ul li')
            .toArray()
            .map((item, index): DataItem => {
                // Add index parameter
                const el = $(item);
                const a = el.find('a.event-card-link').first();
                const pElements = el.find('p');
                return {
                    title: a.attr('aria-label') || a.text(),
                    link: a.attr('href')!,
                    pubDate: startTime.add(index, 'second').toDate(), // Increment pubDate by 1 second for each item
                    author: pElements.length > 1 ? $(pElements[1]).text() : '',
                    category: ['event'],
                };
            });

        const formattedEventType = capitalizeWords(eventType.replaceAll('-', ' '));
        const formattedRegion = capitalizeWords(region.replaceAll('-', ' '));

        return {
            title: `${formattedEventType} in ${formattedRegion}`,
            link,
            item: items,
        };
    },
};

function capitalizeWords(str: string): string {
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
