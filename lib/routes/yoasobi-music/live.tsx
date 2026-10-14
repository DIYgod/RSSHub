import { type Cheerio, load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

import { parseJSONP } from './jsonp-helper';

const normalizeContactText = (value: string): string => value.replaceAll(/\s/g, '');
const isHttpUrl = (value: unknown): value is string => {
    if (typeof value !== 'string') {
        return false;
    }
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
};
export const route: Route = {
    path: '/live',
    categories: ['live'],
    example: '/yoasobi-music/live',
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
            source: ['www.yoasobi-music.jp/', 'www.yoasobi-music.jp/live'],
        },
    ],
    name: 'Live',
    maintainers: ['Kiotlin'],
    handler,
    url: 'www.yoasobi-music.jp/',
};
async function handler() {
    const artist = 'YOASOBI',
        sonyUrl = 'https://www.sonymusic.co.jp',
        baseUrl = 'https://www.sonymusic.co.jp/json/v2/artist',
        postfix = 'start/0/count/-1';
    const api = `${baseUrl}/${artist}/live/${postfix}`;
    const officialUrl = 'https://www.yoasobi-music.jp/live';
    const title = 'LATEST LIVE';
    const response = await got({
        method: 'get',
        url: api,
    });
    const data = parseJSONP(response.data).items.map((item) => ({
        title: item.tourName,
        imageLink: item.tourImage === '' ? undefined : `${sonyUrl}${item.tourImage}`,
        link: `${officialUrl}/${item.link.split('/').pop()}`,
        description: item.tourInfo,
        // @param {Array} liveItem - An array contains all the sessions
        sessions: item.liveItem,
    }));
    return {
        // the source title
        title,
        // the source url
        link: officialUrl,
        // the source description
        description: "YOASOBI's Latest Live",
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: renderDescription(item.imageLink, item.description, item.sessions),
            // no pubDate
            // the article link
            link: item.link,
        })),
    };
}
const renderDescription = (image: string | undefined, description: string, sessions): string => {
    const $ = load(description);
    const mainText = normalizeContactText($.text());
    const mainLinks = new Set(mapElements($('a[href]'), (_, link) => $(link).attr('href')));
    return renderToString(
        <>
            {image ? <img src={image} /> : undefined}
            {raw(description)}
            {sessions.map((session, index) => (
                <div key={`${session.date}-${index}`} style="margin: 0.5em 0; padding: 0.5em 1em; border: 0.1em solid palevioletred;">
                    <p>
                        {session.date} [{session.youbi}]
                    </p>
                    <p style="color: palevioletred;">{session.tourName}</p>
                    <p>
                        会場: {session.area}{' '}
                        <a href={session.mapURL} target="_blank">
                            {session.place}
                        </a>
                    </p>
                    <p>
                        開場/開演: {session.open}/{session.start}
                    </p>
                    {session.price ? <p style="white-space: pre-line;">料金: {session.price}</p> : undefined}
                    {session.saleDate ? <p>発売日: {session.saleDate}</p> : undefined}
                    {session.inquire && !mainText.includes(normalizeContactText(session.inquire)) ? <p>お問い合わせ: {session.inquire}</p> : undefined}
                    {session.inquire_tel && !mainText.includes(normalizeContactText(session.inquire_tel)) ? <p>電話: {session.inquire_tel}</p> : undefined}
                    {isHttpUrl(session.inquire_url) && !mainLinks.has(session.inquire_url) ? (
                        <p>
                            <a href={session.inquire_url}>お問い合わせ先</a>
                        </p>
                    ) : undefined}
                </div>
            ))}
        </>
    );
};
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
