import { createHash } from 'node:crypto';

import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseJSONP } from './jsonp-helper';

const parseInfoDate = (date?: string): Date | undefined => {
    if (typeof date !== 'string' || !/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(date)) {
        return;
    }
    const parsedDate = parseDate(date, ['YYYY.MM.DD', 'YYYY.M.D', 'YYYY.MM.D', 'YYYY.M.DD'], true);
    return Number.isFinite(parsedDate.getTime()) ? parsedDate : undefined;
};

export const route: Route = {
    path: '/info/:category?',
    categories: ['live'],
    example: '/yoasobi-music/info/news',
    parameters: { category: '`news` (default), `biography`' },
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
            source: ['www.yoasobi-music.jp/', 'www.yoasobi-music.jp/:category'],
            target: '/info/:category',
        },
    ],
    name: 'News & Biography',
    maintainers: ['Kiotlin'],
    handler,
    url: 'www.yoasobi-music.jp/',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';
    if (category !== 'news' && category !== 'biography') {
        throw new InvalidParameterError('Category must be news or biography');
    }

    const artist = 'YOASOBI',
        sonyUrl = 'https://www.sonymusic.co.jp',
        baseUrl = 'https://www.sonymusic.co.jp/json/v2/artist',
        postfix = category === 'news' ? 'start/0/count/-1' : 'start/0/count/-1/callback/hotCallback';

    const officialUrl = `https://www.yoasobi-music.jp/${category}`;
    const api = `${baseUrl}/${artist}/${category === 'news' ? 'information' : 'hottopic'}/${postfix}`;
    const title = `LATEST ${category.toUpperCase()}`;

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => {
        const isBio = category === 'biography';

        return {
            id: isBio ? undefined : item.id,
            guid: isBio
                ? `bio:${createHash('sha256')
                      .update(JSON.stringify([item.url, item.kiji]))
                      .digest('hex')}`
                : `news:${item.id}`,
            title: isBio ? item.url : item.title,
            category: item.category,
            date: isBio ? item.url : item.date,
            description: isBio ? item.kiji : item.article,
            image: isBio ? (item.image_url === '' ? undefined : `${sonyUrl}${item.image_url}`) : undefined,
        };
    });

    return {
        // the source title
        title,
        // the source url
        link: officialUrl,
        // the source description
        description: `Yoasobi's latest ${category}`,
        // iterate through all leaf objects
        item: data.map((i) => ({
            // the article title
            title: i.title,
            // the article content
            description: renderDescription(i.image, i.description.replaceAll('\n', '<br>')),
            // the article publish time
            pubDate: parseInfoDate(i.date),
            // guid
            guid: i.guid,
            // the article link
            link: i.id ? `${officialUrl}/${i.id}` : officialUrl,
            category: i.category,
        })),
    };
}

const renderDescription = (image: string | undefined, description: string): string =>
    renderToString(
        <>
            {image ? <img src={image} /> : undefined}
            {raw(description)}
        </>
    );
