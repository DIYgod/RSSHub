import { load } from 'cheerio';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

dayjs.extend(utc);

export const route: Route = {
    path: '/ranking',
    categories: ['new-media'],
    example: '/sznews/ranking',
    name: '排行榜',
    maintainers: ['nczitzk'],
    handler,
};

async function getArticle(originalLink: string): Promise<Partial<DataItem>> {
    let link = originalLink;
    let detailResponse = await ofetch(link);

    const fulltext = detailResponse.match(/<a href="(.*)">全文阅读<\/a>/);

    if (fulltext) {
        link = fulltext[1];
        detailResponse = await ofetch(link);
    }

    const content = load(detailResponse);
    const articleDate = detailResponse
        .match(/<!--enpproperty[\s\S]*?<date>([^<]+)<\/date>/)?.[1]
        ?.trim()
        .replace(/:(\d{1,3})$/, (_, milliseconds: string) => `:${milliseconds.padStart(3, '0')}`);
    const date = articleDate || content('.a_time').text().trim() || content('.article-info span').first().text().replace('发布时间：', '').trim();

    return {
        link,
        description: content('.article-content').html() ?? undefined,
        author: content('.a_source').text().replace('来源： ', '') || undefined,
        pubDate: date ? timezone(parseDate(date, articleDate ? 'YYYY-MM-DD HH:mm:ss:SSS' : undefined), 8) : undefined,
    };
}

async function handler() {
    const rootUrl = 'https://www.sznews.com';
    const currentUrl = `${rootUrl}/ranking/${dayjs().utcOffset(8).format('YYYY-MM-DD')}.json`;

    const response = await ofetch(currentUrl);

    const list: Array<{ title: string; link: string }> = response.data.map((item) => ({
        title: item.TITLE,
        link: item.URL.replace('http://', 'https://'),
    }));

    const items = await pMap(list, async (item) => ({ ...item, ...(await cache.tryGet(`sznews:ranking:article:v2:${item.link}`, () => getArticle(item.link))) }), { concurrency: 3 });

    return {
        title: '焦点新闻 - 深圳新闻网',
        link: 'http://news.sznews.com',
        item: items,
    };
}
