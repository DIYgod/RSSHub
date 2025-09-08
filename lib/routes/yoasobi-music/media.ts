import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseJSONP } from './jsonp-helper';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/media',
    categories: ['live'],
    example: '/yoasobi-music/media',
    parameters: {},
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
            source: ['www.yoasobi-music.jp/', 'www.yoasobi-music.jp/media'],
        },
    ],
    name: 'Media',
    maintainers: ['Kiotlin'],
    handler,
    url: 'www.yoasobi-music.jp/',
};

async function handler() {
    const ARTIST = 'YOASOBI',
        BASEURL = 'https://www.sonymusic.co.jp/json/v2/artist',
        POSTFIX = 'start/0/count/-1';

    const api = `${BASEURL}/${ARTIST}/media/${POSTFIX}`;
    const officialUrl = 'https://www.yoasobi-music.jp/media';
    const title = 'LATEST MEDIA';

    const response = await ofetch(api);

    const data = Object.values(parseJSONP(response.data).items)
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((item) => ({
            date: item.date,
            weekDay: item.youbi,
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            tvStation: item.media || null,
            title: item.program || item.media,
            description: item.note,
        }));

    return {
        // the source title
        title,
        // the source url
        link: officialUrl,
        // the source description
        description: "YOASOBI's Latest Media",
        // iterate through all leaf objects
        item: data.map((i) => ({
            // the article title
            title: i.title,
            // the article content
            description: art(path.join(__dirname, 'templates/media.art'), {
                date: i.date,
                weekDay: i.weekDay,
                postFix: i.startTime && i.endTime && i.tvStation ? `${i.startTime} ~ ${i.endTime} ${i.tvStation}` : null,
                description: i.description,
            }),
            // no pubDate
            pubDate: i.date,
            // specify guid because the link is not unique
            guid: i.title + i.date,
            // the article link
            link: officialUrl,
        })),
    };
}
