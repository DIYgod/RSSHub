import type { Data, DataItem, Route } from '@/types';
import { toTitleCase } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import type { Context } from 'hono';

export const route: Route = {
    path: '/:region/:eventType?',
    categories: ['other'],
    example: '/eventbrite/canada--toronto/all-events',
    parameters: { eventType: 'category of events for filtering', region: 'Region or scope of events' },
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
            source: ['eventbrite.com/d/:region/:eventType', 'eventbrite.ca/d/:region/:eventType'],
            target: '/:region/:eventType',
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
        const link = `https://www.eventbrite.com/d/${region}/${eventType}/`;
        const response = await ofetch(link, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0',
            },
        });
        const $ = load(response);
        const eventsApiUrl = new URL('https://www.eventbrite.com/api/v3/destination/events');
        // exclude promoted events
        const eventListEl = $('div.search-results-panel-content section>ul>li')
            .toArray()
            .filter((item) => !$(item).text().includes('Promoted'));
        const eventIds = eventListEl.map((item) => $(item).find('a.event-card-link').first().attr('data-event-id'));
        eventsApiUrl.searchParams.append('event_ids', eventIds.join(','));
        const eventsData: EventbriteEvent[] = (await ofetch(eventsApiUrl.href)).events;
        const items = eventListEl.map((item, index): DataItem => {
            const el = $(item);
            const a = el.find('.event-card-details a.event-card-link').first();
            const fallbackTitle = a.attr('aria-label') || a.text() || a.toString();

            const eventData = eventsData[index];
            if (eventData === undefined) {
                const pElements = el.find('p');
                return {
                    title: `should be ${fallbackTitle}`,
                    author: pElements.length > 1 ? `should be ${$(pElements[1]).text()}` : 'unknown author',
                };
            }
            return {
                title: eventData.name,
                link: eventData.url,
                pubDate: parseDate(eventData.published),
                author: eventData.primary_organizer === undefined ? JSON.stringify(eventData) : eventData.primary_organizer.name,
                category: eventData.tags.map((tag) => tag.display_name),
                image: eventData?.image?.original?.url,
                description: eventData.summary,
                id: eventData.eventbrite_event_id,
                content: {
                    html: `${eventDate(eventData)}\n${getAuthor(eventData)}\n${getTicketPriceRange(eventData)}`,
                    text: '',
                },
            };
        });

        const formattedEventType = toTitleCase(eventType.replaceAll('-', ' '));
        const formattedRegion = toTitleCase(region.replaceAll('-', ' '));

        return {
            title: `${formattedEventType} in ${formattedRegion}`,
            link,
            item: items,
        };
    },
};

function getAuthor(event: EventbriteEvent) {
    return `<a href="${event.primary_organizer.url}">${event.primary_organizer.name}</a>`;
}

function getTicketPriceRange(event: EventbriteEvent) {
    return '';
    const minPrice = event.ticket_availability.minimum_ticket_price.display;
    const maxPrice = event.ticket_availability.maximum_ticket_price.display;
    if (minPrice === maxPrice) {
        return minPrice;
    }
    return `${minPrice} - ${maxPrice}`;
}

function eventDate(event: EventbriteEvent): string {
    const endDate = event.end_date;
    const startDate = event.start_date;
    const startTime = event.start_time;
    const endTime = event.end_time;
    if (startDate === endDate) {
        return `${startDate} ${startTime} - ${endTime}`;
    }
    return `${startDate} ${startTime} - ${endDate} ${endTime}`;
}

interface EventbriteEvent {
    name: string;
    url: string;
    published: string;
    primary_organizer: {
        name: string;
        url: string;
    };
    summary: string;
    tags: {
        display_name: string;
    }[];
    image: {
        url: string;
        original: {
            url: string;
        };
    };
    eventbrite_event_id: string;
    ticket_availability: {
        maximum_ticket_price: {
            display: string;
        };
        minimum_ticket_price: {
            display: string;
        };
        is_free: boolean;
    };
    timezone: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
}
