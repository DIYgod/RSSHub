import { load } from 'cheerio';
import type { FetchOptions, FetchRequest, ResponseType } from 'ofetch';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { API_HOST, CDN_HOST, HOST } from './constant';
import { renderPost } from './templates/post';
import type { PortfolioDetailResponse, PortfolioResponse, UserNextData } from './types';

export function getCacheKey(key: string) {
    return `cara:${md5(config.cara.cookie ?? '')}:${key}`;
}

export async function customFetch<T = any, R extends ResponseType = 'json'>(request: FetchRequest, options?: FetchOptions<R>) {
    const target = new URL(typeof request === 'string' ? request : request.url);
    if (target.origin !== HOST || target.username || target.password) {
        throw new Error('Cara requests must use https://cara.app.');
    }

    const response = await ofetch.raw<T, R>(target.href, {
        ...options,
        redirect: 'manual',
        headers: {
            'user-agent': config.trueUA,
            ...(config.cara.cookie && { cookie: config.cara.cookie }),
        },
        onResponse({ response }) {
            if (response.status >= 300 && response.status < 400) {
                throw new Error('Cara returned a redirect; the configured Cookie was not forwarded.');
            }
            if (response.status === 401) {
                throw new ConfigNotFoundError('Cara requires a valid CARA_COOKIE from a logged-in cara.app session.');
            }
        },
    });
    return response._data!;
}

export async function parseUserData(user: string) {
    const buildId = await cache.tryGet(
        getCacheKey('buildId'),
        async () => {
            const res = await customFetch(`${HOST}/explore`);
            const $ = load(res);
            return JSON.parse($('#__NEXT_DATA__')?.text() ?? '{}').buildId;
        },
        config.cache.routeExpire,
        false
    );
    return cache.tryGet(getCacheKey(`user:${user}`), async () => {
        const data = await customFetch<UserNextData>(`${HOST}/_next/data/${buildId}/${user}.json`);
        return data.pageProps.user;
    });
}

export async function fetchPortfolioItem(item: PortfolioResponse['data'][number]) {
    const res = await customFetch<PortfolioDetailResponse>(`${API_HOST}/posts/${item.postId}`);

    const description = renderPost({
        content: res.data.content,
        images: res.data.images.filter((i) => !i.isCoverImg).map((image) => ({ src: `${CDN_HOST}/${image.src}` })),
    });

    const dataItem: DataItem = {
        title: res.data.title || res.data.content,
        pubDate: parseDate(res.data.createdAt),
        link: `${HOST}/post/${item.postId}`,
        description,
    };

    return dataItem;
}
