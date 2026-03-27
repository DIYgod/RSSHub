import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';

import { renderSubscriptionImages } from './templates/subscriptions';
import { apiqRootUrl, imageRootUrl, rootUrl } from './utils';

const md = MarkdownIt({
    html: true,
});

const apiHeaders = {
    'Content-Type': 'application/json',
    'X-Site': 'www.iwara.tv',
    Origin: rootUrl,
    Referer: `${rootUrl}/`,
    Accept: 'application/json',
    'User-Agent': config.trueUA,
};

export const route: Route = {
    path: '/subscriptions',
    categories: ['anime'],
    example: '/iwara/subscriptions',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'IWARA_USERNAME',
                description: '',
            },
            {
                name: 'IWARA_PASSWORD',
                description: '',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.iwara.tv/subscriptions/videos', 'www.iwara.tv/subscriptions/images'],
        },
    ],
    name: 'User Subscriptions',
    maintainers: ['FeCCC'],
    handler,
    url: 'www.iwara.tv/',
    description: `::: warning
  This route requires username and password, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/deploy/config#route-specific-configurations) for route-specific configurations.
:::`,
};

async function handler() {
    if (!config.iwara || !config.iwara.username || !config.iwara.password) {
        throw new ConfigNotFoundError('Iwara subscription RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const username = config.iwara.username;
    const password = config.iwara.password;

    const { page, destory } = await getPuppeteerPage(rootUrl, {
        gotoConfig: {
            waitUntil: 'domcontentloaded',
        },
    });

    try {
        const fetchApi = (url: string, options: any) =>
            page.evaluate(
                async (args) => {
                    const res = await fetch(args.url, {
                        method: args.options.method || 'GET',
                        headers: args.options.headers,
                        body: args.options.body ? JSON.stringify(args.options.body) : undefined,
                    });
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                },
                { url, options }
            );

        // login and get refresh token
        const refreshHeaders = await cache.tryGet(
            'iwara:token',
            async () => {
                const result = await fetchApi(`${apiqRootUrl}/user/login`, {
                    method: 'POST',
                    headers: apiHeaders,
                    body: { email: username, password },
                });
                return { authorization: 'Bearer ' + result.token };
            },
            30 * 24 * 60 * 60,
            false
        );

        // get access token
        const authHeaders = await cache.tryGet(
            'iwara:authToken',
            async () => {
                const result = await fetchApi(`${apiqRootUrl}/user/token`, {
                    method: 'POST',
                    headers: { ...apiHeaders, Authorization: refreshHeaders.authorization },
                });
                return { authorization: 'Bearer ' + result.accessToken };
            },
            60 * 60,
            false
        );

        const authedHeaders = { ...apiHeaders, Authorization: authHeaders.authorization };

        // fetch subscriptions
        const [videoResponse, imageResponse] = await Promise.all([
            fetchApi(`${apiqRootUrl}/videos?rating=all&page=0&limit=24&subscribed=true`, { headers: authedHeaders }),
            fetchApi(`${apiqRootUrl}/images?rating=all&page=0&limit=24&subscribed=true`, { headers: authedHeaders }),
        ]);

        const videoList = videoResponse.results.map((item) => {
            const imageUrl = item.file ? `${imageRootUrl}/image/original/${item.file.id}/thumbnail-${item.thumbnail.toString().padStart(2, '0')}.jpg` : '';

            return {
                title: item.title,
                author: item.user.name,
                link: `${rootUrl}/video/${item.id}`,
                category: ['Video', ...(item.tags ? item.tags.map((i) => i.id) : [])],
                imageUrl,
                pubDate: parseDate(item.createdAt),
                private: item.private,
            };
        });

        const imageList = imageResponse.results.map((item) => {
            const imageUrl = item.thumbnail ? `${imageRootUrl}/image/original/${item.thumbnail.id}/${item.thumbnail.name}` : '';
            return {
                title: item.title,
                author: item.user.name,
                link: `${rootUrl}/image/${item.id}`,
                category: ['Image', ...(item.tags ? item.tags.map((i) => i.id) : [])],
                imageUrl,
                pubDate: parseDate(item.createdAt),
            };
        });

        // fulltext
        const list = [...videoList, ...imageList];
        // Execute fetches with limited concurrency
        const items = await pMap(
            list,
            (item) =>
                cache.tryGet(item.link, async () => {
                    let description = renderSubscriptionImages([item.imageUrl]);

                    if (item.private === true) {
                        description += 'private';
                        return {
                            title: item.title,
                            author: item.author,
                            link: item.link,
                            category: item.category,
                            pubDate: item.pubDate,
                            description,
                        };
                    }

                    const apiUrl = item.link.replace('www.iwara.tv', 'apiq.iwara.tv');
                    const response = await fetchApi(apiUrl, { headers: authedHeaders });

                    description = renderSubscriptionImages(response.files ? response.files.filter((f) => f.type === 'image').map((f) => `${imageRootUrl}/image/original/${f.id}/${f.name}`) : [item.imageUrl]);

                    const body = response.body ? md.render(response.body) : '';
                    description += body;

                    return {
                        title: item.title,
                        author: item.author,
                        link: item.link,
                        category: item.category,
                        pubDate: item.pubDate,
                        description,
                    };
                }),
            { concurrency: 5 }
        );

        return {
            title: 'Iwara Subscription',
            link: rootUrl,
            item: items,
        };
    } finally {
        await destory();
    }
}
