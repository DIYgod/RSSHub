import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/ifanr/index',
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
            source: ['www.ifanr.com/'],
        },
    ],
    name: '首页',
    maintainers: ['donghongfei'],
    handler,
    url: 'www.ifanr.com',
};

interface FeedArticle {
    id: string | number;
    post_id: string | number;
    post_title: string;
    post_url: string;
    created_at: number;
    created_by: { name: string };
}

function parseTimestamp(value: number | string) {
    const date = value ? parseDate(value, 'X') : undefined;
    return date && Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler() {
    const apiUrl = 'https://sso.ifanr.com/api/v5/wp/web-feed/?limit=20&offset=0';
    const resp = await got({
        method: 'get',
        url: apiUrl,
    });
    const list: FeedArticle[] = resp.data.objects.filter((item) => item.post_type !== 'column');
    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`ifanr:article:${item.post_id}`, async () => {
                const response = await got(`https://sso.ifanr.com/api/v5/wp/article/?post_id=${item.post_id}`);
                const articleData = response.data.objects[0];
                const banner = articleData.post_cover_image;
                return `${banner ? `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>` : ''}${articleData.post_content}`;
            });
            return {
                title: item.post_title,
                description,
                link: item.post_url,
                pubDate: parseTimestamp(item.created_at),
                author: item.created_by.name,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '爱范儿',
        link: 'https://www.ifanr.com',
        description: '爱范儿首页',
        item: items,
    };
}
