import { load } from 'cheerio';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';
import { fixArticleContent } from '@/utils/wechat-mp';

dayjs.extend(utc);

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/cug/news',
    radar: [
        {
            source: ['esearch.cug.edu.cn'],
        },
    ],
    name: '今日文章 - 包含全校网站最新通知',
    maintainers: ['Doradx'],
    handler,
    url: 'esearch.cug.edu.cn',
};

async function handler(ctx) {
    const host = 'https://esearch.cug.edu.cn';
    const now = dayjs().utcOffset(8);

    const responses = await Promise.all(
        [0, 1].map((day) =>
            ofetch(`${host}/ai_service/search-server/needle/search`, {
                method: 'POST',
                body: {
                    aliasName: 'collection_data',
                    searchDateType: 'custom',
                    keyWord: '',
                    searchOperator: 0,
                    channelId: 'comprehensive',
                    page: {
                        current: 0,
                        size: 10,
                    },
                    searchScope: 3,
                    orderType: 'date',
                    searchAggregation: false,
                    fragmentSize: 40,
                    rangeFilter: [
                        {
                            start: now.subtract(day + 1, 'day').format('YYYY-MM-DD HH:mm:ss'),
                            end: now.subtract(day, 'day').format('YYYY-MM-DD HH:mm:ss'),
                            fieldName: 'publishTime',
                        },
                    ],
                },
            })
        )
    );

    const results = responses
        .flatMap((response) => response.data.page.records)
        .map((item) => ({
            title: item.title,
            link: item.url.replace('http:', 'https:'),
            pubDate: timezone(parseDate(item.publishTime), 8),
            author: item.seedInfo?.seedName,
            description: item.html,
        }));

    const articles = ctx.req.query('sorted') === 'false' ? results : [...results].sort((a, b) => Number(b.pubDate) - Number(a.pubDate));
    const limit = getRouteLimit(ctx);
    const out = await Promise.all(
        articles.slice(0, limit).map((item) =>
            cache.tryGet(`cug:news:article:v2:${item.link}`, async () => {
                try {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    const hostname = new URL(item.link).hostname;
                    const contentSelector = hostname === 't.m.youth.cn' ? '#content' : '.v_news_content';
                    item.description = hostname === 'mp.weixin.qq.com' ? fixArticleContent($('#js_content')) || item.description : ($(contentSelector).html() ?? item.description);
                } catch (error) {
                    if (!(error instanceof Error) || !('statusCode' in error) || error.statusCode !== 404) {
                        throw error;
                    }
                    logger.warn(`Failed to fetch ${item.link}: ${error}`);
                }
                return item;
            })
        )
    );

    return {
        title: 'CUG-今日文章',
        link: host,
        description: '中国地质大学(武汉) 每日文章，几乎包含全校站点最新信息。',
        item: out,
    };
}
