import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderAudio, renderEmbed, renderQuestion, renderTable, renderVideo } from './templates/description';

const SITE_URL = 'https://elevenlabs.io';
const BLOG_URL = `${SITE_URL}/blog`;
const BODY_SELECTOR = 'article .rich-text-blog > .typography';
const DEFAULT_LIMIT = 20;
const DETAIL_CONCURRENCY = 5;

interface VideoSource {
    src: string;
    type: string;
}

function httpsUrl(value: string) {
    if (!value.trim()) {
        return;
    }
    const url = URL.parse(value, SITE_URL);
    if (url?.protocol === 'https:' && !url.username && !url.password) {
        return url;
    }
}

function publisherAsset(value: string) {
    const url = httpsUrl(value);
    if (url && (url.hostname === 'elevenlabs.io' || url.hostname.endsWith('.elevenlabs.io'))) {
        return url.href;
    }
}

function imageUrl(value: string) {
    const url = httpsUrl(value);
    if (url?.origin === SITE_URL && url.pathname === '/_next/image') {
        return publisherAsset(url.searchParams.get('url') ?? '');
    }
    return url?.href;
}

function readEntry($: CheerioAPI, element: Element) {
    const item = $(element);
    const title = item.children('title').text();
    const url = httpsUrl(item.children('link').text());
    if (!title || url?.origin !== SITE_URL || !url.pathname.startsWith('/blog/')) {
        return;
    }
    const date = item.children('pubDate').text();
    return {
        title,
        link: url.origin + url.pathname,
        pubDate: date ? parseDate(date) : undefined,
        category: item
            .children('category')
            .toArray()
            .map((category) => $(category).text()),
        author:
            item
                .children(String.raw`dc\:creator`)
                .toArray()
                .map((author) => $(author).text())
                .join(', ') || undefined,
    };
}

function restoreFaq($: CheerioAPI, body: Cheerio<Element>) {
    for (const element of body.find('button[slot="trigger"][aria-controls]').toArray()) {
        const button = $(element);
        const id = button.attr('aria-controls');
        body.find('[role="group"]')
            .filter((_index, panel) => $(panel).attr('id') === id)
            .removeAttr('hidden aria-hidden style');
        button.replaceWith(renderQuestion(button.text()));
    }
}

function tableCells($: CheerioAPI, row: Element) {
    return $(row)
        .children('[role="cell"], [role="rowheader"], [role="columnheader"]')
        .toArray()
        .map((element) => {
            const cell = $(element);
            return { html: cell.html() ?? '', header: cell.attr('role') !== 'cell' };
        });
}

function restoreTables($: CheerioAPI, body: Cheerio<Element>) {
    for (const element of body.find('div[role="table"]').toArray()) {
        const table = $(element);
        const rows = table
            .children('[role="row"], [role="rowgroup"]')
            .toArray()
            .flatMap((row) => {
                const groupedRows = $(row).children('[role="row"]').toArray();
                return groupedRows.length ? groupedRows.map((groupedRow) => tableCells($, groupedRow)) : [tableCells($, row)];
            });
        table.replaceWith(renderTable(rows));
    }
}

function videoSources($: CheerioAPI) {
    // The article's player props are serialized in the Next.js Flight stream.
    const stream = $('script')
        .toArray()
        .flatMap((element) =>
            Array.from(
                $(element)
                    .text()
                    .matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g),
                (match) => JSON.parse(match[1]) as string
            )
        )
        .join('');
    return Array.from(stream.matchAll(/"ratio":"[^"]+","src":("(?:\\.|[^"\\])*"|\[[^\]\n]*\]),"withBorder":[^,\n]+,"withPlayButtonLabels":/g), (match) => JSON.parse(match[1]) as string | VideoSource[]);
}

function externalVideo(source: string) {
    const url = httpsUrl(source);
    const numericId = /^\/\d+$/;
    const shortYoutubeId = /^\/[\w-]{11}$/;
    if (url?.hostname === 'vimeo.com' && numericId.test(url.pathname)) {
        return renderEmbed(`https://player.vimeo.com/video${url.pathname}`, url.href);
    }
    if (url?.hostname === 'youtu.be' && shortYoutubeId.test(url.pathname)) {
        return renderEmbed(`https://www.youtube-nocookie.com/embed${url.pathname}`, url.href);
    }
}

function playerMarkup(source: string | VideoSource[], rawPoster: string | undefined) {
    if (typeof source === 'string') {
        return externalVideo(source);
    }
    const mp4 = source.find((item) => item.type === 'video/mp4');
    const src = publisherAsset(mp4?.src ?? '');
    if (!src) {
        return;
    }
    const poster = rawPoster ? imageUrl(rawPoster) : undefined;
    return renderVideo(src, poster);
}

function restoreVideos($: CheerioAPI, body: Cheerio<Element>, link: string) {
    const placeholders = body.find('figure [class~="tw-aspect-video"]').toArray();
    if (!placeholders.length) {
        return;
    }
    const sources = videoSources($);
    if (placeholders.length !== sources.length) {
        throw new Error(`ElevenLabs blog video data did not match the article: ${link}`);
    }
    for (const [index, element] of placeholders.entries()) {
        const placeholder = $(element);
        const rawPoster = placeholder.find('img').first().attr('src');
        const markup = playerMarkup(sources[index], rawPoster);
        if (!markup) {
            throw new Error(`ElevenLabs blog video source was unsupported: ${link}`);
        }
        placeholder.replaceWith(markup);
    }
}

function normalizeMedia($: CheerioAPI, body: Cheerio<Element>) {
    for (const element of body.find('img').toArray()) {
        const img = $(element);
        const src = imageUrl(img.attr('src') ?? '');
        if (src) {
            img.attr('src', src).removeAttr('srcset sizes style');
        }
    }
    for (const element of body.find('audio[src]').toArray()) {
        const audio = $(element);
        const src = publisherAsset(audio.attr('src') ?? '');
        if (src) {
            audio.replaceWith(renderAudio(src));
        }
    }
}

const fetchDetail = (link: string) =>
    cache.tryGet(`elevenlabs:blog:${link}`, async () => {
        const html = await ofetch(link, { responseType: 'text', retry: 1, timeout: 10000 });
        const $ = load(html);
        const body = $(BODY_SELECTOR).first();
        if (!body.length) {
            throw new Error(`ElevenLabs blog article body was missing: ${link}`);
        }
        restoreFaq($, body);
        restoreVideos($, body, link);
        normalizeMedia($, body);
        body.find('script, style, noscript, template, button, svg[aria-hidden="true"]').remove();
        restoreTables($, body);
        const cover = imageUrl($('meta[property="og:image"]').attr('content') ?? '');
        const image = cover && cover !== `${SITE_URL}/cover.png` ? cover : body.find('img').first().attr('src');
        return { description: body.html() ?? '', image };
    });

async function handler(ctx: Context): Promise<Data> {
    const xml = await ofetch(`${BLOG_URL}/rss.xml`, { responseType: 'text' });
    const $ = load(xml, { xmlMode: true });
    const entries = $('rss > channel > item')
        .toArray()
        .map((element) => readEntry($, element))
        .filter((entry) => entry !== undefined);
    const uniqueEntries = new Map(entries.map((entry) => [entry.link, entry])).values().toArray();
    const item = await pMap(
        uniqueEntries.slice(0, getRouteLimit(ctx, DEFAULT_LIMIT)),
        async (entry) => {
            const detail = await fetchDetail(entry.link);
            return { ...entry, ...detail };
        },
        { concurrency: DETAIL_CONCURRENCY }
    );
    return {
        title: 'ElevenLabs Blog',
        link: BLOG_URL,
        language: 'en',
        item,
    };
}

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'elevenlabs.io/blog',
    example: '/elevenlabs/blog',
    categories: ['new-media'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Full-text product updates, research, and customer stories from the official blog.',
    zh: {
        name: '博客',
        description: '通过官方 RSS 获取 ElevenLabs 的产品动态、研究文章和客户案例全文。',
    },
    radar: [
        {
            source: ['elevenlabs.io/blog', 'elevenlabs.io/blog/:slug', 'elevenlabs.io/blog/rss.xml'],
            target: '/blog',
        },
    ],
    handler,
};
