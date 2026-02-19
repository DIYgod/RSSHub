import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getToken, sign } from './utils';

export const route: Route = {
    path: '/index/recommend',
    categories: ['programming'],
    example: '/51cto/index/recommend',
    radar: [
        {
            source: ['51cto.com/'],
        },
    ],
    name: '推荐',
    maintainers: ['cnkmmk', 'ovo-tim'],
    handler,
    url: '51cto.com/',
};

const pattern = /'(WTKkN|bOYDu|wyeCN)':\s*(\d+)/g;

async function getFullcontent(item, cookie = '') {
    const articleResponse = await ofetch(item.url, {
        headers: {
            cookie,
        },
    });
    const $ = load(articleResponse);

    const fullContent = new URL(item.url).host === 'ost.51cto.com' ? $('.posts-content').html() : $('article').html();

    if (!fullContent && cookie === '') {
        // If fullContent is null and haven't tried to request with cookie, try to get fullContent with cookie
        try {
            // More details: https://github.com/DIYgod/RSSHub/pull/16583#discussion_r1738643033
            const _matches = articleResponse!.match(pattern)!.slice(0, 3);
            const matches = _matches.map((str) => Number(str.split(':')[1]));
            const [v1, v2, v3] = matches;
            const cookie = '__tst_status=' + (v1 + v2 + v3) + '#;';
            return await getFullcontent(item, cookie);
        } catch (error) {
            logger.error(error);
        }
    }

    return {
        title: item.title,
        link: item.url,
        pubDate: parseDate(item.pubdate, +8),
        description: fullContent || item.abstract, // Return item.abstract if fullContent is null
    };
}

async function handler(ctx) {
    const url = 'https://api-media.51cto.com';
    const requestPath = 'index/index/recommend';
    const token = (await getToken()) as string;
    const timestamp = Date.now();
    const params = {
        page: 1,
        page_size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50,
        limit_time: 0,
        name_en: '',
    };

    const response = await got(`${url}/${requestPath}`, {
        searchParams: {
            ...params,
            timestamp,
            token,
            sign: sign(requestPath, params, timestamp, token),
        },
    });
    const list = response.data.data.data.list;

    const items = await Promise.all(list.map((item) => cache.tryGet(item.url, async () => await getFullcontent(item))));

    return {
        title: '51CTO',
        link: 'https://www.51cto.com/',
        description: '51cto - 推荐',
        item: items,
    };
}
