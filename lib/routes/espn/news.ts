import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';

const renderMedia = (media) =>
    art(path.join(__dirname, 'templates/media.art'), {
        video: {
            cover: media.posterImages?.full?.href || media.posterImages?.default?.href,
            src: media.links?.source.mezzanine?.href || media.links?.source.HD?.href || media.links?.source.full?.href || media.links?.source.href,
            title: media.title,
            description: media.description,
        },
        image: {
            src: media.url,
            alt: media.alt,
            caption: media.caption,
            credit: media.credit,
        },
    });

const junkPattern = /inline\d+|alsosee/;
const mediaPattern = /(photo|video)(\d+)/;

export const route: Route = {
    path: '/news/:sport',
    name: 'News',
    maintainers: ['weijianduan0302'],
    example: '/espn/news/nba',
    categories: ['traditional-media'],
    parameters: { sport: 'sport category, can be nba, nfl, mlb, nhl etc.' },
    description: `Get the news feed of the sport you love on ESPN.
| Sport                |  sport  |  Sport         |  sport  |
|----------------------|---------|----------------|---------|
| 🏀 NBA                | nba     | 🎾 Tennis       | tennis  |
| 🏀 WNBA               | wnba    | ⛳️ Golf         | golf    |
| 🏈 NFL                | nfl     | 🏏 Cricket      | cricket |
| ⚾️ MLB                | mlb     | ⚽️ Soccer       | soccer  |
| 🏒 NHL                | nhl     | 🏎️ F1           | f1      |
| ⛹️ College Basketball | ncb      | 🥊 MMA          | mma     |
| 🏟️️ College Football   | ncf     | 🏈 UFL          | ufl     |
| 🏉 Rugby              | rugby   | 🃏 Poker        | poker   |`,
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

        const handledTypes = new Set(['HeadlineNews', 'Story', 'Media', 'Shortstop']);
        const list = response.feed
            .filter((item) => handledTypes.has(item.data.now[0].type))
            .map((item) => {
                const itemDetail = item.data.now[0];
                const itemType = itemDetail.type;

                return {
                    title: itemDetail.headline,
                    link: itemDetail.links.web.href,
                    author: itemDetail.byline,
                    pubDate: item.date,
                    // for videos and shortstops, no need to extract full text below
                    description: itemType === 'Media' ? renderMedia(itemDetail.video[0]) : itemType === 'Shortstop' ? itemDetail.headline : '',
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

                        const $ = cheerio.load(article.content.story, null, false);
                        $('*').each((_, ele) => {
                            if (junkPattern.test(ele.name)) {
                                $(ele).remove();
                            }
                            if (mediaPattern.test(ele.name)) {
                                const mediaType = ele.name.match(mediaPattern)[1] === 'photo' ? 'images' : 'video';
                                const mediaIndex = Number.parseInt(ele.name.match(mediaPattern)[2]) - 1;
                                const media = article.content[mediaType][mediaIndex];
                                if (media) {
                                    $(ele).replaceWith(renderMedia(media));
                                } else {
                                    $(ele).remove();
                                }
                            }
                        });

                        item.description = $.html();
                    }

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
