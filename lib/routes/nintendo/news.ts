import { type CheerioAPI, load } from 'cheerio';
import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/nintendo/news',
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
            source: ['nintendo.com.hk/topics', 'nintendo.com.hk/'],
        },
    ],
    name: 'News（Hong Kong only）',
    maintainers: ['HFO4'],
    handler,
    url: 'nintendo.com.hk/topics',
};

type Image = { url: string; description?: string };
type Software = { title: string; nsuid: string; pageLink?: string; pageLinkCustom?: string; imageHero?: Image };
type BodyBlock = {
    tinyMce?: string;
    text?: string;
    header?: string;
    image?: Image;
    image1?: Image;
    image2?: Image;
    noteHtml1?: string;
    noteHtml2?: string;
    notePlain1?: string;
    notePlain2?: string;
    btnText?: string;
    btnLink?: string;
    youtube?: string;
    sliderCollection?: { items: Array<{ slideImage?: Image; noteHtml1?: string; notePlain1?: string }> };
    softwareListCollection?: { items: Software[] };
};
type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };
type Article = { title: string; displayDate: string; category: string; bodyCollection: { items: BodyBlock[] } };

function isArticle(value: JsonValue): value is Article {
    return (
        !!value &&
        typeof value === 'object' &&
        'title' in value &&
        typeof value.title === 'string' &&
        'displayDate' in value &&
        typeof value.displayDate === 'string' &&
        'bodyCollection' in value &&
        !!value.bodyCollection &&
        typeof value.bodyCollection === 'object' &&
        'items' in value.bodyCollection &&
        Array.isArray(value.bodyCollection.items)
    );
}

function resolveFlightValue(value: JsonValue, records: Map<string, JsonValue>, seen = new Set<string>()): JsonValue {
    if (typeof value === 'string') {
        const reference = /^\$([\da-f]+)$/.exec(value);
        if (reference && records.has(reference[1]) && !seen.has(reference[1])) {
            return resolveFlightValue(records.get(reference[1]), records, new Set([...seen, reference[1]]));
        }
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((entry) => resolveFlightValue(entry, records, seen));
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveFlightValue(entry, records, seen)]));
    }
    return value;
}

function findArticle(value: JsonValue, records: Map<string, JsonValue>): Article | undefined {
    if (!value || typeof value !== 'object') {
        return;
    }
    if ('article' in value) {
        const article = resolveFlightValue(value.article, records);
        if (isArticle(article)) {
            return article;
        }
    }
    for (const entry of Object.values(value)) {
        const article = findArticle(entry, records);
        if (article) {
            return article;
        }
    }
}

function readArticle($: CheerioAPI): Article {
    const chunks = $('script')
        .toArray()
        .flatMap((script) => {
            const match = $(script)
                .text()
                .match(/^self\.__next_f\.push\((\[.*\])\);?$/s);
            if (!match) {
                return [];
            }
            const chunk = JSON.parse(match[1]);
            return chunk[0] === 1 && typeof chunk[1] === 'string' ? [chunk[1]] : [];
        });
    const bytes = Buffer.from(chunks.join(''));
    const records = new Map<string, JsonValue>();
    let position = 0;
    while (position < bytes.length) {
        const colon = bytes.indexOf(':', position);
        if (colon === -1) {
            break;
        }
        const id = bytes.subarray(position, colon).toString();
        position = colon + 1;
        if (bytes[position] === 84) {
            // Flight text records use a hexadecimal UTF-8 byte length, and may contain newlines.
            const comma = bytes.indexOf(',', position);
            const length = Number.parseInt(bytes.subarray(position + 1, comma).toString(), 16);
            if (comma === -1 || !Number.isFinite(length) || comma + 1 + length > bytes.length) {
                throw new Error('Nintendo article contains an incomplete text record');
            }
            records.set(id, bytes.subarray(comma + 1, comma + 1 + length).toString());
            position = comma + 1 + length;
        } else {
            const newline = bytes.indexOf('\n', position);
            const end = newline === -1 ? bytes.length : newline;
            const payload = bytes.subarray(position, end).toString();
            if (payload.startsWith('[') || payload.startsWith('{') || payload.startsWith('"')) {
                records.set(id, JSON.parse(payload));
            }
            position = end + 1;
        }
    }
    for (const record of records.values()) {
        const article = findArticle(record, records);
        if (article) {
            return article;
        }
    }
    throw new Error('Nintendo article data is missing from the source page');
}

const renderImage = (image?: Image) => (image?.url ? `<img src="${escapeAttribute(image.url)}" alt="${escapeAttribute(image.description ?? '')}">` : '');
const renderNote = (html?: string, text?: string) => html || (text ? `<p>${escapeText(text).replaceAll('\n', '<br>')}</p>` : '');
function renderBody(block: BodyBlock): string {
    return [
        block.header ? `<h2>${escapeText(block.header)}</h2>` : '',
        renderImage(block.image || block.image1),
        block.tinyMce || block.text || '',
        renderNote(block.noteHtml1, block.notePlain1),
        renderImage(block.image2),
        renderNote(block.noteHtml2, block.notePlain2),
        block.youtube ? `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(block.youtube)}"></iframe>` : '',
        ...(block.sliderCollection?.items.map((slide) => renderImage(slide.slideImage) + renderNote(slide.noteHtml1, slide.notePlain1)) ?? []),
        ...(block.softwareListCollection?.items.map((software) => {
            const href = (software.pageLinkCustom || software.pageLink)?.replaceAll('{NSUID}', () => software.nsuid);
            const title = escapeText(software.title);
            return `<h3>${href ? `<a href="${escapeAttribute(href)}">${title}</a>` : title}</h3>${renderImage(software.imageHero)}`;
        }) ?? []),
        block.btnLink && block.btnText ? `<p><a href="${escapeAttribute(block.btnLink)}">${escapeText(block.btnText)}</a></p>` : '',
    ].join('');
}

async function handler(ctx) {
    const rootUrl = 'https://www.nintendo.com.hk';
    const response = await got(`${rootUrl}/topics/`);
    const $ = load(response.data);
    const limit = getRouteLimit(ctx, 30);
    const seen = new Set<string>();
    const list = $('a[href*="/topics/article/"]')
        .toArray()
        .map((element) => ({ title: $(element).find('.ncmn-softUnit__name').text(), link: new URL($(element).attr('href')!, rootUrl).href }))
        .filter((item) => {
            if (!item.title || seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, limit);
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`nintendo:news:flight:v1:${item.link}`, async () => {
                const { data } = await got(item.link);
                const article = readArticle(load(data));
                const description = article.bodyCollection.items.map(renderBody).join('');
                if (!description) {
                    throw new Error(`Nintendo article has no body content: ${item.link}`);
                }
                return { description, pubDate: parseDate(article.displayDate), category: article.category };
            })),
        }),
        { concurrency: 3 }
    );
    return {
        title: 'Nintendo（香港）主页资讯',
        link: `${rootUrl}/topics/`,
        description: 'Nintendo 香港有限公司官网刊登的资讯',
        item: items,
    };
}
