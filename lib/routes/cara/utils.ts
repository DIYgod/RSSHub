import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import type { FetchOptions, FetchRequest, ResponseType } from 'ofetch';
import asyncPool from 'tiny-async-pool';
import type { PortfolioDetailResponse, PortfolioResponse, UserNextData } from './types';
import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { API_HOST, CDN_HOST, HOST } from './constant';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export function customFetch<T = any, R extends ResponseType = 'json'>(request: FetchRequest, options?: FetchOptions<R>) {
    return ofetch<T, R>(request, {
        ...options,
        headers: {
            'user-agent': config.trueUA,
        },
    });
}

export async function parseUserData(user: string) {
    const buildId = await cache.tryGet(
        `${HOST}:buildId`,
        async () => {
            const res = await customFetch(`${HOST}/explore`);
            const $ = load(res);
            return JSON.parse($('#__NEXT_DATA__')?.text() ?? '{}').buildId;
        },
        config.cache.routeExpire,
        false
    );
    return (await cache.tryGet(`${HOST}:${user}`, async () => {
        const data = await customFetch<UserNextData>(`${HOST}/_next/data/${buildId}/${user}.json`);
        return data.pageProps.user;
    })) as Promise<UserNextData['pageProps']['user']>;
}

export async function asyncPoolAll<IN, OUT>(poolLimit: number, array: readonly IN[], iteratorFn: (generator: IN) => Promise<OUT>) {
    const results: Awaited<OUT[]> = [];
    for await (const result of asyncPool(poolLimit, array, iteratorFn)) {
        results.push(result);
    }
    return results;
}

export async function fetchPortfolioItem(item: PortfolioResponse['data'][number]) {
    const res = await customFetch<PortfolioDetailResponse>(`${API_HOST}/posts/${item.postId}`);

    const description = res.data.images
        .filter((i) => !i.isCoverImg)
        .map((image) => `<img src="${CDN_HOST}/${image.src}" />`)
        .join('<br />');

    const dataItem: DataItem = {
        title: res.data.title || res.data.content,
        pubDate: parseDate(res.data.createdAt),
        link: `${HOST}/post/${item.postId}`,
        description,
    };

    return dataItem;
}
