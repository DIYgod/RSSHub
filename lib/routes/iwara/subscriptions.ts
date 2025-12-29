import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderSubscriptionImages } from './templates/subscriptions';

const md = MarkdownIt({
    html: true,
});

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
        requirePuppeteer: false,
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

    const rootUrl = 'https://www.iwara.tv';
    const username = config.iwara.username;
    const password = config.iwara.password;

    // get refresh token
    const refreshHeaders = await cache.tryGet(
        'iwara:token',
        async () => {
            const loginResponse = await ofetch('https://api.iwara.tv/user/login', {
                method: 'post',
                headers: {
                    referer: 'https://www.iwara.tv/',
                    'user-agent': config.trueUA,
                },
                body: {
                    email: username,
                    password,
                },
            });
            return {
                authorization: 'Bearer ' + loginResponse.token,
            };
        },
        30 * 24 * 60 * 60,
        false
    );

    // get subscription list
    const videoSubUrl = 'https://api.iwara.tv/videos?rating=all&page=0&limit=24&subscribed=true';
    const imageSubUrl = 'https://api.iwara.tv/images?rating=all&page=0&limit=24&subscribed=true';

    // get access token
    const authHeaders = await cache.tryGet(
        'iwara:authToken',
        async () => {
            const accessResponse = await ofetch('https://api.iwara.tv/user/token', {
                method: 'post',
                headers: {
                    ...refreshHeaders,
                    referer: 'https://www.iwara.tv/',
                    'user-agent': config.trueUA,
                },
            });
            return {
                authorization: 'Bearer ' + accessResponse.accessToken,
            };
        },
        60 * 60,
        false
    );

    const videoResponse = await ofetch(videoSubUrl, {
        headers: authHeaders,
    });

    const imageResponse = await ofetch(imageSubUrl, {
        headers: {
            ...authHeaders,
            'user-agent': config.trueUA,
        },
    });

    const videoList = videoResponse.results.map((item) => {
        const imgPath = 'https://i.iwara.tv/image/original/';
        const imageUrl = item.file ? `${imgPath}${item.file.id}/thumbnail-${item.thumbnail.toString().padStart(2, '0')}.jpg` : '';

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
        const imageUrl = item.thumbnail ? `https://i.iwara.tv/image/original/${item.thumbnail.id}/${item.thumbnail.name}` : '';
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
    const items = await Promise.all(
        list.map((item) =>
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
                const link = item.link.replace('www.iwara.tv', 'api.iwara.tv');
                const response = await ofetch(link, {
                    headers: {
                        ...authHeaders,
                        'user-agent': config.trueUA,
                    },
                });

                description = renderSubscriptionImages(response.files ? response.files.filter((f) => f.type === 'image')?.map((f) => `https://i.iwara.tv/image/original/${f.id}/${f.name}`) : [item.imageUrl]);

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
            })
        )
    );

    return {
        title: 'Iwara Subscription',
        link: rootUrl,
        item: items,
    };
}
