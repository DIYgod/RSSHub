import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const baseUrl = `http://${namespace.url}`;
const listUrl = `${baseUrl}/selectedPage`;
const imageBaseUrl = 'http://imgoss.cnu.cc';
const forumImageBaseUrl = 'http://img.cnu.cc/forum';
const requestHeaders = {
    'User-Agent': config.trueUA,
};

interface CnuImage {
    img?: string;
    width?: number | string;
    height?: number | string;
    content?: string;
    text?: string;
}

interface CnuListItem {
    title: string;
    link: string;
    author?: string;
    category?: string[];
    image?: string;
    pubDate?: Date;
    summary?: string;
}

export const route: Route = {
    path: '/',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/cnu.cc',
    parameters: {},
    radar: [
        {
            source: ['www.cnu.cc/', 'www.cnu.cc/selectedPage'],
            target: '',
        },
    ],
    name: '每日精选',
    description: '镜像 CNU 首页“每日精选”列表。',
    maintainers: ['ZHA30'],
    handler,
    url: 'www.cnu.cc',
};

async function handler(ctx: Context) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '', 10) || 20;
    const html = await ofetch<string, 'text'>(listUrl, {
        responseType: 'text',
        headers: requestHeaders,
    });
    const $ = load(html);

    const list = extractListItems($).slice(0, limit);
    const items = await Promise.all(list.map((item) => cache.tryGet(`cnu.cc:${item.link}`, async () => await fetchDetail(item))));

    const sectionTitle = $('h2.ulTitle').first().text().trim() || '每日精选';

    return {
        title: `${namespace.name} - ${sectionTitle}`,
        link: baseUrl,
        description: $('meta[name="description"]').attr('content')?.trim() || undefined,
        language: namespace.lang,
        item: items,
    };
}

function extractListItems($): CnuListItem[] {
    const items: CnuListItem[] = [];
    let currentDate: string | undefined;

    for (const element of $('#selected').children().toArray()) {
        const node = $(element);

        if (node.hasClass('date')) {
            currentDate = cleanText(node.text());
            continue;
        }

        if (element.tagName !== 'li') {
            continue;
        }

        const link = node.find('a.workCover').first().attr('href');
        if (!link) {
            continue;
        }

        const workType = cleanText(node.find('.workType').first().text());

        items.push({
            title: cleanText(node.find('.workTitle').first().text()),
            link,
            author: cleanText(node.find('.authorInfo a.author').first().text()) || undefined,
            category: workType ? [workType] : undefined,
            image: node.find('a.workCover img').first().attr('src') || undefined,
            pubDate: currentDate ? timezone(parseDate(currentDate), 8) : undefined,
            summary: node.find('.workBody').first().html()?.trim() || undefined,
        });
    }

    return items;
}

async function fetchDetail(item: CnuListItem): Promise<DataItem> {
    const html = await ofetch<string, 'text'>(item.link, {
        responseType: 'text',
        headers: requestHeaders,
    });
    const $ = load(html);
    const images = parseImages($);
    const title = cleanText($('.work-title').first().text()) || item.title;
    const author = cleanText($('.author-info a strong').first().text()) || cleanText($('.work-head .author_info .name a').first().text()) || item.author;
    const pubDateText = $('.timeago[title]').first().attr('title');
    const pubDate = pubDateText ? timezone(parseDate(pubDateText), 8) : item.pubDate;
    const image = getImageUrl(images[0]) || $('.jumbotron img').first().attr('src') || item.image;
    const description = buildDescription($, images) || item.summary;
    const category = getCategories($, item, title, author);

    return {
        title,
        link: item.link,
        description,
        pubDate,
        author,
        category: category.length > 0 ? category : undefined,
        image,
    };
}

function parseImages($): CnuImage[] {
    const raw = $('#imgs_json').text().trim();
    if (!raw) {
        return [];
    }

    try {
        const images = JSON.parse(raw);
        return Array.isArray(images) ? images : [];
    } catch {
        return [];
    }
}

function buildDescription($, images: CnuImage[]): string | undefined {
    const parts: string[] = [];
    const intro = $('#work_body').html()?.trim();

    if (intro) {
        parts.push(intro);
    }

    for (const image of images) {
        const imageUrl = getImageUrl(image);
        if (!imageUrl) {
            continue;
        }

        parts.push(`<div class="thumbnail"><img class="bodyImg" src="${imageUrl}"></div>`);

        if (image.content) {
            parts.push(`<div class="img_description">${image.content}</div>`);
        }

        if (image.text) {
            parts.push(`<p>${image.text}</p>`);
        }
    }

    const description = parts.join('');
    return description || undefined;
}

function getCategories($, item: CnuListItem, title: string, author?: string): string[] {
    const categories = item.category ? new Set(item.category) : new Set<string>();

    for (const element of $('.work-info a.category').toArray()) {
        const category = cleanText($(element).text());
        if (category) {
            categories.add(category);
        }
    }

    if ($('.work-info a.category').length === 0) {
        const titleText = cleanText($('title').text());
        const fallbackCategory = titleText
            .split(' - ')
            .map((part) => cleanText(part))
            .find((part) => part && part !== title && part !== author && part !== namespace.name);

        if (fallbackCategory) {
            categories.add(fallbackCategory);
        }
    }

    return [...categories];
}

function getImageUrl(image?: CnuImage): string | undefined {
    if (!image?.img) {
        return undefined;
    }

    return image.height === 'auto' ? `${forumImageBaseUrl}/${image.img}` : `${imageBaseUrl}/${image.img}?x-oss-process=style/content`;
}

function cleanText(value?: string): string {
    return value?.replaceAll(/\s+/g, ' ').trim() ?? '';
}
