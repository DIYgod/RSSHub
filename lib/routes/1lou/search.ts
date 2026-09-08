import type { Context } from 'hono';

import type { DataItem, Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseItems } from './util';

const rootUrl = 'https://www.1lou.me';
const apiUrl = 'https://www.1lou.me/search/api/search.php';

export const handler = async (ctx: Context) => {
    const { params } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    const searchQuery = params;

    const apiParams = new URLSearchParams({
        q: searchQuery,
        fid: '0',
        page: '1',
        sort: 'newest',
        scope: '全部',
        type: '全部',
        year: '全部',
        quality: '全部',
        source: '全部',
        track: '1',
    });

    const apiUrlWithParams = `${apiUrl}?${apiParams.toString()}`;

    const { data: response } = await got(apiUrlWithParams);

    const hits: Array<{
        tid: number;
        fid: number;
        subject: string;
        highlighted_subject: string;
        username: string;
        create_date: number;
        views: number;
        posts: number;
        files: number;
        thread_url: string;
    }> = response?.data?.hits ?? [];

    const language: Language = 'zh';

    const items: Array<DataItem & { link: string }> = hits.slice(0, limit).map((item) => ({
        title: item.highlighted_subject.replaceAll(/<\/?mark>/g, ''),
        pubDate: parseDate(item.create_date, 'X'),
        link: new URL(item.thread_url, rootUrl).href,
        category: [item.username],
        author: item.username,
        language,
    }));

    const refinedItems = await parseItems(items, language);

    const author = 'BT 之家 1LOU 站';

    return {
        title: `搜索 ${searchQuery} - ${author}`,
        description: response?.data?.query ? `搜索关键词: ${response.data.query}` : '搜索结果',
        link: `${rootUrl}/search?q=${encodeURIComponent(searchQuery)}`,
        item: refinedItems,
        allowEmpty: true,
        author,
        language,
    };
};

export const route: Route = {
    path: '/search/:params',
    name: '搜索',
    url: '1lou.me/search',
    maintainers: ['JimenezLi'],
    handler,
    example: '/1lou/search/繁花',
    parameters: { params: '搜索关键词' },
    description: '搜索路由，支持关键词搜索。',
    categories: ['multimedia'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['1lou.me/search'],
            target: (_, url) => {
                const parsedUrl = new URL(url);
                const searchParams = parsedUrl.searchParams;
                const query = searchParams.get('q') || parsedUrl.pathname.match(/\/search-(.+)-\d+\.htm/)?.[1] || '';

                return `/1lou/search/${query}`;
            },
        },
    ],
};
