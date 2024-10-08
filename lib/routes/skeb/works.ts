import { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { processWorkItem, baseUrl } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/works/:username',
    categories: ['picture'],
    example: '/works/@brm2_1925',
    parameters: { username: 'Skeb Username with @' },
    features: {
        requireConfig: [
            {
                name: 'Request_Key',
                optional: false,
                description: '從 Cookie 中獲取',
            },
            {
                name: 'Bearer_Token',
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

    if (!username) {
        throw new InvalidParameterError('Invalid username');
    }

    if (!config.skeb || !config.skeb.bearer_token) {
        throw new ConfigNotFoundError('Skeb works RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const url = `${baseUrl}/api/users/${username.replace('@', '')}/works`;

    const items = await cache.tryGet(url, async () => {
        const data = await ofetch(url, {
            method: 'GET',
            query: { role: 'creator', sort: 'date', offset: '0' },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
                Cookie: `request_key=${config.skeb.request_key}`,
                Authorization: `Bearer ${config.skeb.bearer_token}`,
            },
            parseResponse: JSON.parse,
        });

        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid data received from API');
        }

        return data.map((item) => processWorkItem(item)).filter(Boolean);
    });

    return {
        title: `Skeb - ${username}'s Works`,
        link: `${baseUrl}/${username}`,
        item: items as DataItem[],
    };
}
