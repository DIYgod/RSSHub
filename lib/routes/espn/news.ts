import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import Parser from 'rss-parser';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/en';
dayjs.locale('en');
dayjs.extend(timezone);
dayjs.extend(utc);

const parser = new Parser();

export const route: Route = {
    path: '/news/:sport',
    name: 'ESPN News Archive',
    maintainers: ['GymRat102'],
    example: '/news/nba',
    categories: ['traditional-media'],
    parameters: { sport: 'sport category, can be nba, nfl, mlb, nhl etc.' },
    description: `Get the news feed of the sport you love on ESPN.
| Sport                |  sport  |  Sport         |  sport  |
|----------------------|---------|----------------|---------|
| 🏀NBA                | nba     | 🎾Tennis       | tennis  |
| 🏀WNBA               | wnba    | ⛳️Golf         | golf    |
| 🏈NFL                | nfl     | 🏏Cricket      | cricket |
| ⚾️MLB                | mlb     | 🏍️Motorsports  | rpm     |
| 🏒NHL                | nhl     | 🏎️F1           | f1      |
| ⛹️College Basketball | nhl     | 🥊MMA          | mma     |
| 🏟️️College Football   | nhl     | 🏈UFL          | uffl    |
| 📆NCAA               | ncaa    | 🏉Rugby        | rugby   |
| 📆NCAA Woman         | ncaaw   | 🃏Poker        | poker   |
| ⚽️Soccer             | soccer  |                |         |`,
    radar: [
        {
            source: ['espn.com/:sport*'],
            target: '/news/:sport',
        },
    ],
    handler: async (ctx) => {
        const { sport = 'nba' } = ctx.req.param();
        const response = await ofetch(`https://www.espn.com/espn/rss/${sport}/news`);
        const feed = await parser.parseString(response);

        const list = feed.items.map((item) => ({
            title: item.title ?? '',
            link: item.link ?? '',
            author: item.creator,
            guid: item.guid,
        }));

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    const rawPubDate = $('.article-meta span.timestamp').text().replace(' ET', '');
                    item.pubDate = dayjs.tz(rawPubDate, 'MMM D, YYYY, HH:mm A', 'America/New_York');

                    item.description = $('.article-body:first p:not(aside p), .article-body:first aside.inline-photo')
                        .map((i, el) => $(el).html())
                        .toArray()
                        .join('<br/><br/>');

                    return item;
                })
            )
        );

        return {
            title: `ESPN ${sport.toUpperCase()} News`,
            link: `https://www.espn.com/espn/rss/${sport}/news`,
            item: items,
        };
    },
};
