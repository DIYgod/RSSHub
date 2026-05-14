import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: ['/search/:category/:keyword', '/search/:keyword'],
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
            target: '/search/:category?/:keyword',
        },
    ],
    name: '검색',
    maintainers: [''],
    handler,
};

const CATEGORY_CONFIG: Record<string, { url: (keyword: string) => string; templateId: string }> = {
    all: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m.all&where=m&sm=mtb_opt&query=${encodeURIComponent(keyword)}&nso=so%3Add&nso_open=1`,
        templateId: 'webItem',
    },
    blog: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_blog.all&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateId: 'ugcItem',
    },
    cafe: {
        url: (keyword) => `https://m.search.naver.com/search.naver?where=m_cafe&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateId: 'webItem',
    },
    news: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_news.all&where=m_news&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateId: 'newsItem',
    },
    video: {
        url: (keyword) => `https://m.search.naver.com/search.naver?ssc=tab.m_video.all&where=m_video&sm=mtb_jum&query=${encodeURIComponent(keyword)}&nso=so%3Add`,
        templateId: 'videoItem',
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

    const items = extractItems(response, config.templateId);

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
        .map((segment) => {
            // videoItem: different field layout from other templates
            if (templateId === 'videoItem') {
                const htmlMatch = segment.match(/"html":"((?:[^"\\]|\\.)*)"/);
                const title = htmlMatch ? cleanText(htmlMatch[1]) : '';
                const authorMatch = segment.match(/"authorHtml":"((?:[^"\\]|\\.)*)"/);
                const author = authorMatch ? cleanText(authorMatch[1]) : '';
                const hrefMatches = [...segment.matchAll(/"href":"((?:[^"\\]|\\.)*)"/g)];
                const links = hrefMatches.map((m) => m[1]);
                // Filter for real video links (YouTube, TikTok, Naver TV/blog/cafe)
                const mediaDomains = /^(https?:\/\/)?(m\.youtube\.com|youtu\.be|www\.youtube\.com|www\.tiktok\.com|tv\.naver\.com|m\.blog\.naver\.com|m\.cafe\.naver\.com)\//;
                const link = links.find((l) => mediaDomains.test(l)) || links[0] || '';
                const dateMatch = segment.match(/"createdAt":"((?:[^"\\]|\\.)*)"/);
                const timeText = dateMatch?.[1] || '';
                const viewMatch = segment.match(/"viewCount":"((?:[^"\\]|\\.)*)"/);
                const viewCount = viewMatch ? cleanText(viewMatch[1]) : '';
                const durationMatch = segment.match(/"playDuration":(\d+)/);
                const duration = durationMatch ? `${durationMatch[1]}초` : '';

                // Require videoPlayerType or playDuration to ensure it's a real video result
                const hasVideoFields = segment.includes('"videoPlayerType"') || segment.includes('"playDuration"');
                if (!title || !link || !timeText || !hasVideoFields) {
                    return null;
                }

                const parts = [];
                if (author) {
                    parts.push(`출처: ${author}`);
                }
                if (viewCount) {
                    parts.push(`조회수: ${viewCount}`);
                }
                if (duration && duration !== '0초') {
                    parts.push(`재생시간: ${duration}`);
                }
                const description = parts.map((p) => `<p>${p}</p>`).join('');

                return {
                    title,
                    link,
                    description,
                    pubDate: parseKoreanRelativeTime(timeText),
                };
            }

            // Extract all title fields
            const titleMatches = [...segment.matchAll(/"title":"((?:[^"\\]|\\.)*)"/g)];
            const titles = titleMatches.map((m) => cleanText(m[1]));

            // Extract URLs depending on template type
            let link = '';
            if (templateId === 'webItem') {
                // webItem: first href is the result link
                const hrefMatch = segment.match(/"href":"((?:[^"\\]|\\.)*)"/);
                link = hrefMatch?.[1] || '';
            } else {
                // ugcItem, newsItem: last titleHref is the result link
                const hrefMatches = [...segment.matchAll(/"titleHref":"((?:[^"\\]|\\.)*)"/g)];
                link = hrefMatches.length > 0 ? hrefMatches.at(-1)[1] : '';
                // Fallback: try direct href
                if (!link) {
                    const hrefMatch = segment.match(/"href":"((?:[^"\\]|\\.)*)"/);
                    link = hrefMatch?.[1] || '';
                }
            }

            // Title: last title is always the result title
            const title = titles.at(-1) || '';
            // Source: second-to-last title
            const sourceName = titles.at(-2) || '';

            // Extract body/description
            let bodyText = '';
            const bodyMatch = segment.match(/"bodyText":"((?:[^"\\]|\\.)*)"/) || segment.match(/"content":"((?:[^"\\]|\\.)*)"/);
            if (bodyMatch) {
                bodyText = cleanText(bodyMatch[1]);
            }

            // Extract time
            let timeText = '';
            switch (templateId) {
                case 'webItem': {
                    const timeMatch = segment.match(/\[{"text":"([^"]*)"}/);
                    timeText = timeMatch?.[1] || '';

                    break;
                }
                case 'newsItem': {
                    const textMatch = segment.match(/"text":"([^"]*)"/);
                    timeText = textMatch?.[1] || '';

                    break;
                }
                case 'ugcItem': {
                    // blog uses createdDate like "2026-05-13T23:15:00+09:00"
                    const dateMatch = segment.match(/"createdDate":"([^"]*)"/);
                    if (dateMatch?.[1]) {
                        return {
                            title,
                            link,
                            description: sourceName ? `<p>출처: ${sourceName}</p><p>${bodyText}</p>` : bodyText,
                            pubDate: new Date(dateMatch[1]),
                        };
                    }

                    break;
                }
                default:
                // Do nothing
            }

            if (!title || !link) {
                return null;
            }

            // Skip non-result items
            if (title === '더보기' || title === '관련도순' || title === '최신순') {
                return null;
            }

            const description = sourceName ? `<p>출처: ${sourceName}</p><p>${bodyText}</p>` : bodyText;

            return {
                title,
                link,
                description,
                pubDate: parseKoreanRelativeTime(timeText),
            };
        })
        .filter(Boolean);
}

function cleanText(text: string): string {
    return text
        .replaceAll(/&(amp|lt|gt|quot);/g, (match) => {
            switch (match) {
                case '&amp;':
                    return '&';
                case '&lt;':
                    return '<';
                case '&gt;':
                    return '>';
                case '&quot;':
                    return '"';
                default:
                    return match;
            }
        })
        .replaceAll('<mark>', '')
        .replaceAll('</mark>', '');
}

function parseKoreanRelativeTime(timeText: string): Date {
    const now = new Date();
    if (!timeText) {
        return now;
    }

    // Try absolute date formats first (e.g. "2025.12.01.", "2026-05-13T23:15:00+09:00")
    const absDate = new Date(timeText);
    if (!Number.isNaN(absDate.getTime())) {
        return absDate;
    }

    const match = timeText.match(/(\d+)\s*(시간|분|일|주) 전|(\d+)분 이내|(\d+)시간 이내|방금/);
    if (!match) {
        return now;
    }

    if (match[0] === '방금') {
        return now;
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

    return now;
}
