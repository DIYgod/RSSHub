import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const dateStringRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const timeStringRegexes = [
    /開場 (?<openHr>\d{2}):(?<openMin>\d{2}) 開演 (?<startHr>\d{2}):(?<startMin>\d{2}) 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
    /開場 - 開演 (?<openHr>\d{2}):(?<openMin>\d{2}) 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
    /開場 (?<openHr>\d{2}):(?<openMin>\d{2}) 開演 - 終演 (?<closeHr>\d{2}):(?<closeMin>\d{2})/,
];

const maxPages = 5;
const pageCount = 10;

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
            source: ['www.eventernote.com/actors/:name/:id/events'],
        },
    ],
    name: '声优活动及演唱会',
    maintainers: ['KTachibanaM'],
    handler,
};

async function handler(ctx) {
    const { name, id } = ctx.req.param();

    const title = `${name}のイベント・ライブ情報一覧`;
    const link = `https://www.eventernote.com/actors/${name}/${id}/events`;

    const events = [];
    for (let page = 1; page <= maxPages; page++) {
        const pageLink = link + `?limit=${pageCount}&page=${page}`;
        // eslint-disable-next-line no-await-in-loop
        const response = await got({
            method: 'get',
            url: pageLink,
        });

        const data = response.data;

        const $ = load(data);
        const list = $('li.clearfix');

        if (list.length === 0) {
            break;
        }

        for (const event of list) {
            // extract event name
            const eventName = $('div.event > h4 > a', event).text();

            // extract event location
            const eventLocation = $('div.event > div.place > a', event).text();

            // extract event date
            const dateMatches = $('div.date > p', event).text().match(dateStringRegex);
            const eventYear = dateMatches.groups.year;
            const eventMonth = dateMatches.groups.month;
            const eventDay = dateMatches.groups.day;

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
終演 ${eventYear}-${eventMonth}-${eventDay} ${eventTimeObj.closeHr}:${eventTimeObj.closeHr}
`;

            events.push({
                title: eventName,
                description: eventDescription,
                link,
            });
        }

        page += 1;
    }

    return {
        title,
        link,
        description: title,
        language: 'ja',
        allowEmpty: true,
        item: events,
    };
}
