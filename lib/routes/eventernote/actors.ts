import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

const dateStringRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const timeStringRegexes = [
    /開場 (?<openHr>\d{2}):(?<openMin>\d{2}) 開演 (?<startHr>\d{2}):(?<startMin>\d{2}) 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
    /開場 - 開演 (?<startHr>\d{2}):(?<startMin>\d{2}) 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
    /開場 (?<openHr>\d{2}):(?<openMin>\d{2}) 開演 - 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
];

const pageCount = 20;

export const route: Route = {
    path: '/actors/:name/:id',
    categories: ['anime'],
    view: ViewType.Videos,
    example: '/eventernote/actors/三森すずこ/2634',
    parameters: { name: '声优姓名', id: '声优 ID' },
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
            source: ['www.eventernote.com/actors/:name/:id', 'www.eventernote.com/actors/:name/:id/events'],
        },
    ],
    name: '声优活动及演唱会',
    maintainers: ['KTachibanaM'],
    handler,
};

async function handler(ctx: Context) {
    const { name, id } = ctx.req.param();

    const title = `${name}のイベント・ライブ情報一覧`;
    const link = `https://www.eventernote.com/actors/${name}/${id}/events`;

    const response = await ofetch(`${link}?limit=${pageCount}&page=1`);
    const events = parseEvents(response);

    return {
        title,
        link,
        description: title,
        language: 'ja' as const,
        item: events,
    };
}

function parseEvents(response: string) {
    const $ = load(response);
    const list = $('li.clearfix');

    if (list.length === 0) {
        return [];
    }

    const pageItems = list
        .toArray()
        .map((event): DataItem => {
            // extract event name
            const eventName = $('div.event > h4 > a', event).text();

            // extract event location
            const eventLocation = $('div.event > div.place > a', event).text();

            // extract event date
            const dateMatches = $('div.date > p', event).text().match(dateStringRegex);
            const eventYear = dateMatches?.groups?.year;
            const eventMonth = dateMatches?.groups?.month;
            const eventDay = dateMatches?.groups?.day;

            // extract event time
            const timeString = $('div.event > div.place > span.s', event).text();
            const eventTimeObj: Record<string, string | undefined> = {};
            for (const r of timeStringRegexes) {
                const m = timeString.match(r);
                if (m === null) {
                    continue;
                }
                Object.assign(eventTimeObj, m.groups);
            }

            // extract event link
            const link = $('div.event > h4 > a', event).attr('href');

            // compute event description
            const eventDate = eventYear && eventMonth && eventDay ? `${eventYear}-${eventMonth}-${eventDay}` : undefined;
            const eventDescription = [
                eventLocation ? `開催場所 ${eventLocation}` : undefined,
                eventDate ? `開催日 ${eventDate}` : undefined,
                eventTimeObj.openHr ? `開場 ${eventTimeObj.openHr}:${eventTimeObj.openMin}` : undefined,
                eventTimeObj.startHr ? `開演 ${eventTimeObj.startHr}:${eventTimeObj.startMin}` : undefined,
                eventTimeObj.closeHr ? `終演 ${eventTimeObj.closeHr}:${eventTimeObj.closeMin}` : undefined,
            ]
                .filter(Boolean)
                .join('\n');

            return {
                title: eventName,
                description: eventDescription,
                link,
            };
        })
        .filter(Boolean);

    return pageItems;
}
