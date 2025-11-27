import { FetchError } from 'ofetch';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:lang/:category?',
    categories: ['new-media'],
    example: '/malaysiakini/en',
    parameters: {
        lang: 'Language, see below',
        category: 'Category, see below, news by default',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: [
            {
                name: 'MALAYSIAKINI_EMAIL',
                optional: true,
                description: 'Malaysiakini Email or Username',
            },
            {
                name: 'MALAYSIAKINI_PASSWORD',
                optional: true,
                description: 'Malaysiakini Password',
            },
            {
                name: 'MALAYSIAKINI_REFRESHTOKEN',
                optional: true,
                description: 'To obtain the refresh token, log into Malaysiakini and look for the cookie `nl____refreshToken` within document.cookie in the browser console. The token is the value of the cookie.',
            },
        ],
    },
    name: 'News',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `
| Language | English | Bahasa Malaysia | 华文     |
| -------- | ------ | ------- | ------ | 
| \`:lang\`  | \`en\`    | \`my\`   | \`zh\`    |

| Category               | \`:category\` |
| ---------------------- | ------------- |
| News                   | \`news\`      |
| Columns                | \`columns\`   |
| From Our Readers       | \`letters\`   |`,
    radar: [
        {
            source: ['malaysiakini.com/'],
            target: '/en',
        },
        {
            source: ['malaysiakini.com/:lang'],
            target: '/:lang',
        },
        {
            source: ['www.malaysiakini.com/:lang/latest/:category'],
            target: '/:lang/:category',
        },
    ],
};

async function handler(ctx) {
    const lang = ctx.req.param('lang');
    const category = ctx.req.param('category') ?? 'news';
    const apiKey = 'UFXL7F1EL53S8DZ5SGJUMG5IIFVRY4WI'; // Assuming the apiKey is static

    const key = {
        email: config.malaysiakini.email,
        password: config.malaysiakini.password,
        apiKey,
    };
    const body = JSON.stringify(key);

    let cookie;

    const cacheIn = await cache.get('malaysiakini:cookie');
    if (cacheIn) {
        cookie = cacheIn;
    }

    if (cookie === undefined && config.malaysiakini.email && config.malaysiakini.password) {
        const login = await got.post('https://membership.malaysiakini.com/api/v1/auth/local', {
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Connection: 'keep-alive',
            },
            body,
        });
        if (login.data.accessToken && login.data.refreshToken) {
            cookie = `nl____accessToken=${login.data.accessToken}; nl____refreshToken=${login.data.refreshToken};`;
            // Refresh token should be sufficient for authenticating for full text, but access token is included for good measure.
            cache.set('malaysiakini:cookie', cookie);
        }
    }

    if (cookie === undefined && config.malaysiakini.refreshToken) {
        cookie = `nl____refreshToken=${config.malaysiakini.refreshToken};`;
        cache.set('malaysiakini:cookie', cookie);
    }

    const link = `https://www.malaysiakini.com/rss/${lang}/${category}.rss`;
    const feed = await parser.parseURL(link);

    if (cookie) {
        // Testing the cookie with the first item of the feed
        try {
            await got({
                method: 'get',
                url: `https://www.malaysiakini.com/api/full_content/${feed.items[0].guid}`,
                headers: {
                    Cookie: cookie,
                },
            });
        } catch (error) {
            if (error instanceof FetchError && error.statusCode === 401) {
                await cache.set('malaysiakini:cookie', '');
            }
            throw error;
        }
    }

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(`https://www.malaysiakini.com/api/content/${item.guid}`);
                if (response.data.stories.content) {
                    item.description = response.data.stories.content;
                } else {
                    item.description = response.data.stories.teaser;
                    if (cookie) {
                        let fullResponse;
                        try {
                            fullResponse = await got({
                                method: 'get',
                                url: `https://www.malaysiakini.com/api/full_content/${item.guid}`,
                                headers: {
                                    Cookie: cookie,
                                },
                            });
                        } finally {
                            if (fullResponse) {
                                item.description = fullResponse.data.content;
                            }
                        }
                    }
                }
                if (response.data.stories.image_feat) {
                    const cover = response.data.stories.image_feat;
                    if (cover.length > 0) {
                        item.description = `<img src=${cover[0]}>` + item.description;
                    }
                }
                if (response.data.stories.author) {
                    item.author = response.data.stories.author;
                }
                if (response.data.stories.tags) {
                    item.category = response.data.stories.tags;
                }
                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        language: lang,
        item: items,
    };
}
