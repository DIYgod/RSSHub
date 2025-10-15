import { type DataItem, type Route, ViewType } from '@/types';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

const dateStringRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const timeStringRegexes = [
    /開場 (?<openHr>\d{2}):(?<openMin>\d{2}) 開演 (?<startHr>\d{2}):(?<startMin>\d{2}) 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
    /開場 - 開演 (?<openHr>\d{2}):(?<openMin>\d{2}) 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
    /開場 (?<openHr>\d{2}):(?<openMin>\d{2}) 開演 - 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
];

const maxPages = 3;
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

    const pageLinks = Array.from({ length: maxPages }, (_, i) => link + `?limit=${pageCount}&page=${i + 1}`);
    const responses = await Promise.all(pageLinks.map((pageUrl) => ofetch(pageUrl)));

    const events = responses.flatMap((response) => {
        const $ = load(response);
        const list = $('li.clearfix');

        if (list.length === 0) {
            return [] as DataItem[];
        }

        const pageItems = list
            .toArray()
            .map((event) => {
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
                let eventTimeObj = {
                    openHr: null,
                    openMin: null,
                    startHr: null,
                    startMin: null,
                    closeHr: null,
                    closeMin: null,
                };
                for (const r of timeStringRegexes) {
                    const m = timeString.match(r);
                    if (m === null) {
                        continue;
                    }
                    eventTimeObj = {
                        ...eventTimeObj,
                        ...m.groups,
                    };
                }

                // extract event link
                const link = $('div.event > h4 > a', event).attr('href');

                // compute event description
                const eventDescription = `イベント ${eventName}
開催場所 ${eventLocation}
開場 ${eventYear}-${eventMonth}-${eventDay} ${eventTimeObj.openHr}:${eventTimeObj.openMin}
開演 ${eventYear}-${eventMonth}-${eventDay} ${eventTimeObj.startHr}:${eventTimeObj.startMin}
終演 ${eventYear}-${eventMonth}-${eventDay} ${eventTimeObj.closeHr}:${eventTimeObj.closeMin}
`;

                return {
                    title: eventName,
                    description: eventDescription,
                    link,
                } as DataItem;
            })
            .filter(Boolean) as DataItem[];

        return pageItems;
    });

    return {
        title,
        link,
        description: title,
        language: 'ja' as const,
        allowEmpty: true,
        item: events,
    };
}
