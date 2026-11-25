import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { sha256 } from '@/utils/hash';
import ofetch from '@/utils/ofetch';
import { compareDates, parseDate } from '@/utils/time';

import { parseJSONP } from './jsonp-helper';

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
    const artist = 'YOASOBI',
        baseUrl = 'https://www.sonymusic.co.jp/json/v2/artist',
        postfix = 'start/0/count/-1';

    const api = `${baseUrl}/${artist}/media/${postfix}`;
    const officialUrl = 'https://www.yoasobi-music.jp/media';
    const title = 'LATEST MEDIA';

    const response = await ofetch(api);

    const data = Object.entries<Array<{ date: string; youbi: string; startTime?: string; endTime?: string; media: string; program?: string; note: string }>>(parseJSONP(response).items)
        .flatMap(([mediaType, items]) => items.map((item) => ({ ...item, mediaType })))
        .toSorted((a, b) => compareDates(parseDate(b.date, 'YYYY.M.D'), parseDate(a.date, 'YYYY.M.D')))
        .map((item) => ({
            date: item.date,
            weekDay: item.youbi,
            startTime: item.startTime,
            endTime: item.endTime,
            tvStation: item.media,
            title: item.program || item.media,
            description: item.note,
            guid: `yoasobi:media:${sha256(JSON.stringify([item.mediaType, item.date, item.media || '', item.program || '', item.startTime || '', item.endTime || '']))}`,
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
            description: renderDescription(i.date, i.weekDay, i.startTime && i.endTime && i.tvStation ? `${i.startTime} ~ ${i.endTime} ${i.tvStation}` : undefined, i.description),
            pubDate: parseDate(i.date, 'YYYY.M.D'),
            // specify guid because the link is not unique
            guid: i.guid,
            // the article link
            link: officialUrl,
        })),
    };
}

const renderDescription = (date: string, weekDay: string, postFix: string | undefined, description: string): string =>
    renderToString(
        <>
            <p>
                {date} [{weekDay}] {postFix}
            </p>
            {raw(description)}
        </>
    );
