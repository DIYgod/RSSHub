import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.fastbull.com';
const currentUrl = `${rootUrl}/cn/express-news`;
const apiUrl = 'https://api.fastbull.com/fastbull-news-service/api/getNewsPageByTagIds';
const stockTagIds = '170,171,150,161,173,152,163,174,154,165,145,156,167,168,158,169,149,95';

export const route: Route = {
    path: '/stock',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/fastbull/stock',
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
            target: '/fastbull/stock',
        },
    ],
    name: '股票重要快讯',
    maintainers: ['maxlixiang'],
    handler,
    url: 'fastbull.com/cn/express-news',
};

type FastBullResponse = {
    code: number;
    subCode?: string;
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
    important?: number;
    path?: string;
    smallImg?: string[] | null;
    newsUnscrambleModel?: {
        content?: string;
        title?: string;
    } | null;
};

async function handler(ctx) {
    const limit = getLimit(ctx);
    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: {
            checkImportant: '1',
            pageSize: String(limit),
            timestamp: '',
            includeCalendar: '1',
            tagIds: stockTagIds,
        },
        headers: {
            referer: currentUrl,
            langid: '1',
            language: '1',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
        },
    });

    const data = response.data as FastBullResponse;

    if (data.code !== 0 || !data.bodyMessage) {
        throw new Error(data.message || 'FastBull API returned an empty response');
    }

    const body = JSON.parse(data.bodyMessage) as FastBullBody;
    const items = (body.pageDatas ?? [])
        .filter((item) => item.newsTitle)
        .map((item) => {
            const link = `${rootUrl}/cn/fastshort/${item.path || item.newsId}`;
            const description = buildDescription(item);

            return {
                title: item.newsTitle,
                link,
                guid: item.newsId || link,
                description,
                pubDate: item.releasedDate ? parseDate(item.releasedDate) : undefined,
            };
        });

    return {
        title: 'FastBull 股票重要快讯',
        link: currentUrl,
        description: 'FastBull 快讯 - 股票 - 只看重要',
        item: items,
    };
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
