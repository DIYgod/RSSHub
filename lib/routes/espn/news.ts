import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/news/:sport',
    name: 'News',
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
| ⚾️MLB                | mlb     | ⚽️Soccer       | soccer  |
| 🏒NHL                | nhl     | 🏎️F1           | f1      |
| ⛹️College Basketball | ncb      | 🥊MMA          | mma     |
| 🏟️️College Football   | ncf     | 🏈UFL          | ufl     |
| 🏉Rugby              | rugby   | 🃏Poker        | poker   |`,
    radar: [
        {
            source: ['espn.com/:sport*'],
            target: '/news/:sport',
        },
    ],
    handler: async (ctx) => {
        const { sport = 'nba' } = ctx.req.param();
        const response = await ofetch(`https://onefeed.fan.api.espn.com/apis/v3/cached/contentEngine/oneFeed/leagues/${sport}?offset=0`, {
            headers: {
                accept: 'application/json',
            },
        });

        const list = response.feed.map((item) => {
            const itemDetail = item.data.now[0];
            const itemType = itemDetail.type;

            return {
                // distinguish among normal news/stories, videos and shortstops
                title: itemType === 'Media' ? `[Video] ${itemDetail.headline}` : itemType === 'Shortstop' ? `[Shortstop] ${itemDetail.headline}` : itemDetail.headline,
                link: itemDetail.links.web.href,
                author: itemType === 'Media' ? '' : itemDetail.byline,
                guid: item.id,
                pubDate: item.date,
                // for videos and shortstops, no need to extract full text below
                description: itemType === 'Media' ? itemDetail.description : itemType === 'Shortstop' ? itemDetail.headline : '',
            };
        });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (item.description === '') {
                        const article = await ofetch(`${item.link}?xhr=1`, {
                            headers: {
                                accept: 'application/json',
                            },
                        });

                        item.description = article.content.story;

                        return item;
                    } else {
                        return item;
                    }
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
