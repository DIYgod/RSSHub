import { load } from 'cheerio';
import { decodeHTML } from 'entities';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/search/:category/:keyword',
    categories: ['other'],
    example: '/naver/search/all/송소희',
    parameters: {
        category: {
            description: '검색 카테고리. 기본값: all (통합검색)',
            default: 'all',
            options: [
                { value: 'all', label: '통합검색' },
                { value: 'blog', label: '블로그' },
                { value: 'cafe', label: '카페' },
                { value: 'news', label: '뉴스' },
                { value: 'video', label: '동영상' },
            ],
        },
        keyword: '검색 키워드',
    },
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
            source: ['m.search.naver.com/search.naver'],
            target: '/search/:category/:keyword',
        },
    ],
    name: '검색',
    maintainers: ['slowmande'],
    handler,
};

const CATEGORY_CONFIG: Record<string, { url: (keyword: string) => string; templateIds: string[] }> = {
    all: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m.all&where=m&sm=mtb_opt&query=${encodeURIComponent(keyword)}&nso=so%3Add&nso_open=1`,
        templateIds: ['webItem', 'ugcItem', 'newsItem', 'videoItem'],
    },
    blog: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_blog.all&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateIds: ['ugcItem'],
    },
    cafe: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_cafe.all&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateIds: ['webItem', 'ugcItem', 'newsItem', 'videoItem'],
    },
    news: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_news.all&where=m_news&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateIds: ['newsItem'],
    },
    video: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_video.all&where=m_video&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateIds: ['videoItem'],
    },
};

const CATEGORY_NAMES: Record<string, string> = {
    all: '통합검색',
    blog: '블로그',
    cafe: '카페',
    news: '뉴스',
    video: '동영상',
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const category = ctx.req.param('category') || 'all';
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.all;
    const url = config.url(keyword);

    const response = await ofetch(url);

    const items = category === 'cafe' ? extractCafeItems(response) : config.templateIds.flatMap((tid) => extractItems(response, tid));

    return {
        title: `${keyword} - 네이버 ${CATEGORY_NAMES[category] || CATEGORY_NAMES.all}`,
        description: `${keyword}의 네이버 ${CATEGORY_NAMES[category] || CATEGORY_NAMES.all} 검색 결과입니다.`,
        link: url,
        item: items,
    };
}

function extractItems(response: string, templateId: string) {
    const segments = response.split(`"templateId":"${templateId}"`);
    return segments
        .slice(0, -1)
        .map((segment) => (templateId === 'videoItem' ? extractVideoItem(segment) : extractGenericItem(segment, templateId)))
        .filter(Boolean);
}

function extractVideoItem(segment: string) {
    const htmlMatch = segment.match(/"html":"((?:[^"\\]|\\.)*)"/);
    const title = htmlMatch ? cleanText(htmlMatch[1]) : '';
    const authorMatch = segment.match(/"authorHtml":"((?:[^"\\]|\\.)*)"/);
    const author = authorMatch ? cleanText(authorMatch[1]) : '';
    const hrefMatches = [...segment.matchAll(/"href":"((?:[^"\\]|\\.)*)"/g)];
    const links = hrefMatches.map((m) => m[1]);
    const mediaDomains = /^(?:https?:\/\/)?(?:m\.youtube\.com|youtu\.be|www\.youtube\.com|www\.tiktok\.com|tv\.naver\.com|m\.blog\.naver\.com|m\.cafe\.naver\.com)\//;
    const link = links.find((l) => mediaDomains.test(l)) || links[0] || '';
    const dateMatch = segment.match(/"createdAt":"((?:[^"\\]|\\.)*)"/);
    const timeText = dateMatch?.[1] || '';
    const viewMatch = segment.match(/"viewCount":"((?:[^"\\]|\\.)*)"/);
    const viewCount = viewMatch ? cleanText(viewMatch[1]) : '';
    const durationMatch = segment.match(/"playDuration":(\d+)/);
    const duration = durationMatch ? `${durationMatch[1]}초` : '';

    const hasVideoFields = segment.includes('"videoPlayerType"') || segment.includes('"playDuration"');
    if (!title || !link || !timeText || !hasVideoFields) {
        return null;
    }

    const pubDate = parseKoreanRelativeTime(timeText);
    return buildVideoResult(title, link, viewCount, duration, author, pubDate);
}

function buildVideoResult(title: string, link: string, viewCount: string, duration: string, author: string, pubDate: Date | undefined) {
    return {
        title,
        link,
        description: buildVideoDescription(viewCount, duration),
        author: author || undefined,
        ...(pubDate && { pubDate }),
    };
}

function buildVideoDescription(viewCount: string, duration: string): string {
    const parts: string[] = [];
    if (viewCount) {
        parts.push(`조회수: ${viewCount}`);
    }
    if (duration && duration !== '0초') {
        parts.push(`재생시간: ${duration}`);
    }
    return parts.map((p) => `<p>${p}</p>`).join('');
}

function extractLink(segment: string, templateId: string): string {
    if (templateId === 'webItem') {
        const hrefMatch = segment.match(/"href":"((?:[^"\\]|\\.)*)"/);
        return hrefMatch?.[1] || '';
    }
    const hrefMatches = [...segment.matchAll(/"titleHref":"((?:[^"\\]|\\.)*)"/g)];
    if (hrefMatches.length > 0) {
        return hrefMatches.at(-1)![1];
    }
    const hrefMatch = segment.match(/"href":"((?:[^"\\]|\\.)*)"/);
    return hrefMatch?.[1] || '';
}

function extractGenericItem(segment: string, templateId: string) {
    const titleMatches = [...segment.matchAll(/"title":"((?:[^"\\]|\\.)*)"/g)];
    const titles = titleMatches.map((m) => cleanText(m[1]));
    const title = titles.at(-1) || '';
    const sourceName = titles.at(-2) || '';
    const link = extractLink(segment, templateId);

    let bodyText = '';
    const bodyMatch = segment.match(/"bodyText":"((?:[^"\\]|\\.)*)"/) || segment.match(/"content":"((?:[^"\\]|\\.)*)"/);
    if (bodyMatch) {
        bodyText = cleanText(bodyMatch[1]);
    }

    if (!title || !link) {
        return null;
    }

    if (['더보기', '관련도순', '최신순'].includes(title)) {
        return null;
    }

    return buildItemFromTemplate(segment, templateId, title, link, bodyText, sourceName);
}

function buildItemFromTemplate(segment: string, templateId: string, title: string, link: string, bodyText: string, sourceName: string) {
    if (templateId === 'ugcItem') {
        const dateMatch = segment.match(/"createdDate":"([^"]*)"/);
        if (dateMatch?.[1]) {
            return { title, link, description: bodyText, author: sourceName || undefined, pubDate: new Date(dateMatch[1]) };
        }
        return null;
    }

    let timeText = '';
    if (templateId === 'webItem') {
        const timeMatch = segment.match(/\[\{"text":"([^"]*)"\}/);
        timeText = timeMatch?.[1] || '';
    } else {
        const textMatch = segment.match(/"text":"([^"]*)"/);
        timeText = textMatch?.[1] || '';
    }

    const pubDate = parseKoreanRelativeTime(timeText);
    return { title, link, description: bodyText, author: sourceName || undefined, ...(pubDate && { pubDate }) };
}

function extractCafeItems(html: string) {
    const $ = load(html);

    return $('li.bx')
        .toArray()
        .map((el): DataItem | null => {
            const $el = $(el);
            const titleEl = $el.find('.title_link');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href') || '';
            const author = $el.find('.name').first().text().trim();
            const timeText = $el.find('.sub').first().text().trim();
            const descEl = $el.find('.dsc_link');
            const description = descEl.length ? descEl.text().trim() : '';

            if (!title || !link) {
                return null;
            }

            const pubDate = parseKoreanRelativeTime(timeText);

            return {
                title,
                link,
                description,
                author: author || undefined,
                ...(pubDate && { pubDate }),
            };
        })
        .filter((item): item is DataItem => item !== null);
}

function cleanText(text: string): string {
    return decodeHTML(text).replaceAll('<mark>', '').replaceAll('</mark>', '');
}

function parseKoreanRelativeTime(timeText: string): Date | undefined {
    const now = new Date();
    if (!timeText) {
        return;
    }

    // Try absolute date formats first (e.g. "2025.12.01.", "2026-05-13T23:15:00+09:00")
    const absDate = new Date(timeText);
    if (!Number.isNaN(absDate.getTime())) {
        return absDate;
    }

    const match = timeText.match(/(\d+)\s*(시간|[분일주]) 전|(\d+)분 이내|(\d+)시간 이내|방금/);
    if (!match) {
        return;
    }

    if (match[0] === '방금') {
        return;
    }

    const num = Number.parseInt(match[1] || match[3] || match[4] || '0', 10);
    const unit = match[2] || '';

    if (unit.includes('분')) {
        return new Date(now.getTime() - num * 60 * 1000);
    }
    if (unit.includes('시간')) {
        return new Date(now.getTime() - num * 60 * 60 * 1000);
    }
    if (unit.includes('일')) {
        return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
    }
    if (unit.includes('주')) {
        return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
    }

    return;
}
