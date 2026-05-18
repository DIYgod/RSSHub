import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';

const link = 'https://news.sina.com.cn/china/';
const feedApi = 'https://feed.mix.sina.com.cn/api/roll/get';
const defaultPageId = '121';
const defaultLid = '1356';

export const route: Route = {
    path: '/china',
    categories: ['new-media'],
    example: '/sina/china',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国内新闻',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['news.sina.com.cn/china/'],
            target: '/sina/china',
        },
    ],
    handler,
};

type SinaFeedItem = {
    ctime?: string;
    intime?: string;
    docid?: string;
    url?: string;
    title?: string;
    summary?: string;
    intro?: string;
    media_name?: string;
};

type SinaFeedResponse = {
    result?: {
        data?: SinaFeedItem[];
    };
};

async function handler(ctx) {
    const { limit = '20' } = ctx.req.query();
    const html = await ofetch(link, {
        headers: commonHeaders,
    });
    const { pageid, lid } = getFeedConfig(html);

    const url = new URL(feedApi);
    url.searchParams.set('pageid', pageid);
    url.searchParams.set('lid', lid);
    url.searchParams.set('num', limit);
    url.searchParams.set('page', '1');

    const response = (await ofetch(url.toString(), {
        headers: {
            ...commonHeaders,
            referer: link,
        },
    })) as SinaFeedResponse;

    const items = (response.result?.data ?? [])
        .flatMap((news) => {
            if (!news.url || !news.title) {
                return [];
            }

            return [
                {
                    title: news.title,
                    link: news.url,
                    guid: news.docid || news.url,
                    pubDate: parseSinaDate(news.url, news.ctime || news.intime),
                    description: news.intro || news.summary || news.media_name || '',
                    author: news.media_name,
                },
            ];
        });

    return {
        title: '新浪国内新闻',
        link,
        item: items,
    };
}

function getFeedConfig(html: string) {
    const pageid = /pageid:\s*(\d+)/.exec(html)?.[1] ?? defaultPageId;
    const lid = /firstTab:\s*\{[\s\S]*?lid:\s*(\d+)/.exec(html)?.[1] ?? defaultLid;

    return {
        pageid,
        lid,
    };
}

function parseSinaDate(itemLink: string, timestamp?: string) {
    const seconds = Number(timestamp);

    if (Number.isFinite(seconds) && seconds > 0) {
        return new Date(seconds * 1000);
    }

    const dateMatch = /\/(\d{4})-(\d{2})-(\d{2})\//.exec(itemLink);

    if (dateMatch) {
        const [, year, month, day] = dateMatch;
        return new Date(`${year}-${month}-${day}T00:00:00+08:00`);
    }
}

const commonHeaders = {
    referer: 'https://news.sina.com.cn/',
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
