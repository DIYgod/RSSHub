import { DataItem, Route } from '@/types';
import BBCUtils from '../bbc/utils';
import { route as userRoute } from './user';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    ...userRoute,
    path: '/bbc-user/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/bbc-user/BBCBreaking',
    handler,
    name: 'BBC User timeline',
    maintainers: ['danilo-delbusso'],
    radar: [
        {
            source: ['twitter.com/:id'],
            target: '/bbc-user/:id',
        },
    ],
};

async function getBBCArticleFromUrl(url: string, item: DataItem): Promise<string | Record<string, any> | null> {
    return await cache.tryGet(url, async () => {
        const response = await ofetch(url);
        const $ = load(response);
        const description = BBCUtils.ProcessFeed($);
        return {
            title: item.title,
            description,
            pubDate: item.pubDate,
            link: url,
        };
    });
}

async function handler(ctx) {
    const userInfo = await userRoute.handler(ctx);
    if (!userInfo.item) {
        return userInfo;
    }
    const promises: Promise<string | Record<string, any> | null>[] = [];

    for (const item of userInfo.item) {
        if (!item.urls) {
            continue;
        }
        const urls = item.urls.map((u) => u.expanded_url).filter(Boolean);
        if (!urls) {
            continue;
        }
        const urlPromises = urls.map((url: string) => getBBCArticleFromUrl(url, item));
        promises.push(...urlPromises);
    }

    const results = await Promise.allSettled(promises);

    userInfo.item = results.filter((result) => result.status === 'fulfilled').map((result) => (result as PromiseFulfilledResult<DataItem>).value);
    return userInfo;
}
