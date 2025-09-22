import { Data, DataItem, Route } from '@/types';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { baseUrl, processWork } from './utils';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/works/:username',
    categories: ['picture'],
    example: '/skeb/works/@brm2_1925',
    parameters: { username: 'Skeb Username with @' },
    features: {
        requireConfig: [
            {
                name: 'SKEB_BEARER_TOKEN',
                optional: false,
                description: '在瀏覽器開發者工具（F12）的主控台中輸入 `localStorage.getItem("token")` 獲取',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Creator Works',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Creator Works',
            source: ['skeb.jp/:username'],
            target: '/works/:username',
        },
    ],
    description: 'Get the latest works of a specific creator on Skeb',
};

async function handler(ctx): Promise<Data> {
    const username = ctx.req.param('username');

    if (!config.skeb || !config.skeb.bearerToken) {
        throw new ConfigNotFoundError('Skeb works RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const url = `${baseUrl}/api/users/${username.replace('@', '')}/works`;

    await ensureRequestKey(url);

    const items = await cache.tryGet(url, async () => {
        const data = await ofetch(url, {
            retry: 0,
            method: 'GET',
            query: { role: 'creator', sort: 'date', offset: '0' },
            headers: {
                'User-Agent': config.ua,
                Cookie: `request_key=${await cache.get('skeb:request_key')}`,
                Authorization: `Bearer ${config.skeb.bearerToken}`,
            },
        });

        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid data received from API');
        }

        return data.map((item) => processWork(item)).filter(Boolean);
    });

    return {
        title: `Skeb - ${username}'s Works`,
        link: `${baseUrl}/${username}`,
        item: items as DataItem[],
    };
}

function hasResponseData(error: unknown): error is { response: { _data: string } } {
    return error !== null && typeof error === 'object' && 'response' in error && typeof (error as { response?: { _data?: unknown } }).response?._data === 'string';
}

async function ensureRequestKey(url: string) {
    if (await cache.get('skeb:request_key')) {
        return;
    }

    try {
        await ofetch(url, {
            retry: 0,
            headers: {
                'User-Agent': config.ua,
                Authorization: `Bearer ${config.skeb.bearerToken}`,
            },
        });
    } catch (error) {
        if (hasResponseData(error)) {
            const newRequestKey = error.response?._data?.match(/request_key=(.*?);/)?.[1];
            if (newRequestKey) {
                cache.set('skeb:request_key', newRequestKey);
                logger.debug(`Retrieved new request_key: ${newRequestKey}`);
            } else {
                logger.error('Failed to extract request_key from error response');
            }
        }
    }
}
