import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.fastbull.com';
const currentUrl = `${rootUrl}/cn/express-news`;
const apiUrl = 'https://api.fastbull.com/fastbull-news-service/api/getNewsPageByTagIds';
const recommendTagIds = '152,110,132,176,111,133,112,134,135,136,114,115,116,117,118,94,97,120,143,121,122,123,124,125,126,105,127,108,109';

export const route: Route = {
    path: '/recommend',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/fastbull/recommend',
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
            source: ['fastbull.com/cn/express-news', 'fastbull.com/express-news'],
            target: '/fastbull/recommend',
        },
    ],
    name: '\u63a8\u8350\u5feb\u8baf',
    maintainers: ['maxlixiang'],
    handler,
    url: 'fastbull.com/cn/express-news',
};

type FastBullResponse = {
    code: number;
    message?: string;
    bodyMessage?: string;
};

type FastBullBody = {
    pageDatas?: FastBullNews[];
};

type FastBullNews = {
    newsId?: string;
    newsTitle?: string;
    releasedDate?: number;
    path?: string;
    smallImg?: string[] | null;
    newsUnscrambleModel?: {
        content?: string;
        title?: string;
    } | null;
};

async function handler(ctx) {
    const limit = getLimit(ctx);
    const body = await getFastBullBody(recommendTagIds, '0', limit);

    return {
        title: 'FastBull \u63a8\u8350\u5feb\u8baf',
        link: currentUrl,
        description: 'FastBull \u5feb\u8baf - \u63a8\u8350 - \u5168\u90e8',
        item: buildItems(body),
    };
}

async function getFastBullBody(tagIds: string, checkImportant: string, limit: number) {
    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: {
            checkImportant,
            pageSize: String(limit),
            timestamp: '',
            includeCalendar: '1',
            tagIds,
        },
        headers: commonHeaders,
    });
    const data = response.data as FastBullResponse;

    if (data.code !== 0 || !data.bodyMessage) {
        throw new Error(data.message || 'FastBull API returned an empty response');
    }

    return JSON.parse(data.bodyMessage) as FastBullBody;
}

function buildItems(body: FastBullBody) {
    return (body.pageDatas ?? [])
        .filter((item) => item.newsTitle)
        .map((item) => {
            const link = `${rootUrl}/cn/fastshort/${item.path || item.newsId}`;

            return {
                title: item.newsTitle,
                link,
                guid: item.newsId || link,
                description: buildDescription(item),
                pubDate: item.releasedDate ? parseDate(item.releasedDate) : undefined,
            };
        });
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 50;

    return Number.isFinite(limit) && limit > 0 ? limit : 50;
}

function buildDescription(item: FastBullNews) {
    const images = item.smallImg ?? [];
    const parts = images.map((image) => `<p><img src="${escapeAttribute(image)}" referrerpolicy="no-referrer"></p>`);
    const summary = item.newsUnscrambleModel?.content || item.newsUnscrambleModel?.title;

    if (item.newsTitle) {
        parts.push(`<p>${escapeHtml(item.newsTitle)}</p>`);
    }

    if (summary) {
        parts.push(`<p>${escapeHtml(summary)}</p>`);
    }

    return parts.join('\n');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}

const commonHeaders = {
    referer: currentUrl,
    langid: '1',
    language: '1',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
