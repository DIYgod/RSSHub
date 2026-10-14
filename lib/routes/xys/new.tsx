import { load } from 'cheerio';
import { escapeText } from 'entities';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function getYouTubeVideoId(url: URL) {
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.pathname === '/watch' ? url.searchParams.get('v') : undefined;
    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : undefined;
}

function parsePlaintextArticle(data: string) {
    const paragraphs = data.split('\n\n');
    const banner = '◇◇新语丝(www.xys.org)(xinyusi.org)(groups.google.com/group/xinyusi)◇◇';
    const fallback = { description: escapeText(data).replaceAll('\n', '<br>\n'), author: undefined };
    if (paragraphs.length < 6 || paragraphs[0].trim() !== banner || paragraphs.at(-1)?.trim() !== banner || !/^\(XYS\d{8}\)$/.test(paragraphs.at(-2)!) || paragraphs[1].includes('\n')) {
        return fallback;
    }

    const byline = paragraphs[2].split('\n').map((line) => line.trim());
    const author =
        byline[0].match(/^·(.+)·$/)?.[1] ??
        byline[0].match(/^作者[：:]\s*(\S.*)$/)?.[1] ??
        (byline[0].startsWith('记者 ') ? byline[0] : undefined) ??
        (byline[1]?.startsWith('@') && /^\d[\d.K]* followers$/.test(byline[2]) && /^\d[\d.K]* following$/.test(byline[3]) && /^\d[\d.K]* posts$/.test(byline[4]) ? byline[0] : undefined);
    if (!author) {
        return fallback;
    }

    // Remove only the framed heading, byline and publication-code paragraphs.
    // Authored signatures, translation credits and dated social posts remain in the body.
    return { author, description: escapeText(paragraphs.slice(3, -2).join('\n\n')).replaceAll('\n', '<br>\n') };
}

async function fetchArticle(link: string) {
    const url = new URL(link);
    if (['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
        const videoId = getYouTubeVideoId(url);
        return { description: videoId ? renderDescription(videoId) : undefined, author: undefined };
    }

    const response = await ofetch.raw<ArrayBuffer, 'arrayBuffer'>(link, { responseType: 'arrayBuffer' });
    // Decode the source GB2312 text.
    const data = iconv.decode(Buffer.from(response._data!), 'gb2312');
    return response.headers.get('content-type')?.startsWith('text/plain') ? parsePlaintextArticle(data) : { description: load(data).text().replaceAll('\n', '<br>\n'), author: undefined };
}

export const route: Route = {
    path: '/new',
    categories: ['blog'],
    example: '/xys/new',
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
            source: ['xys.org/', 'xys.org/new.html'],
        },
    ],
    name: '新到资料',
    maintainers: ['wenzhenl'],
    handler,
    url: 'xys.org/',
};

async function handler(ctx) {
    const rootUrl = 'http://www.xys.org';
    const currentUrl = `${rootUrl}/new.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    // Decode the source GB2312 text.
    const data = iconv.decode(response.data, 'gb2312');

    const $ = load(data);

    const requestedLimit = Number(ctx.req.query('limit'));
    const validLimit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0;
    const limit = validLimit ? requestedLimit : 30;
    let items = $('li a')
        .slice(4, validLimit ? undefined : 30)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            let link = $item.attr('href');
            /^https?:\/\//.test(link!) || (link = rootUrl + '/' + link!.replace(/^\//, ''));
            const dateText = $item.parent().text().trim().slice(0, 8);
            const date = /^\d{2}\.\d{2}\.\d{2}$/.test(dateText) ? parseDate(dateText, 'YY.MM.DD', true) : undefined;
            const url = new URL(link!);
            const isYouTubePage = ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname) && !getYouTubeVideoId(url);
            return {
                title: $item.text(),
                link,
                pubDate: date && Number.isFinite(date.getTime()) ? date : undefined,
                guid: isYouTubePage ? `${link}#xys-${dateText}` : undefined,
            };
        })
        .filter((item) => !item.link!.endsWith('.zip'))
        .slice(0, limit);

    items = await pMap(
        items,
        async (item) => {
            const { description, author } = await cache.tryGet(`xys:article:v1:${item.link}`, () => fetchArticle(item.link!));
            return { ...item, description, author };
        },
        { concurrency: 3 }
    );

    return {
        title: '新语丝 - 新到资料',
        link: currentUrl,
        item: items,
    };
}

const renderDescription = (youTube: string): string => renderToString(<>{youTube ? <iframe width="560" height="315" src={`https://www.youtube-nocookie.com/embed/${youTube}`} frameborder="0" allowfullscreen></iframe> : null}</>);
