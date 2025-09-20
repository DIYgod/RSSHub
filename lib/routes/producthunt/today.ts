import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';

export const route: Route = {
    path: '/today',
    categories: ['other'],
    example: '/producthunt/today',
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
            source: ['www.producthunt.com/'],
        },
    ],
    name: 'Top Products Launching Today',
    maintainers: ['miaoyafeng', 'Fatpandac'],
    handler,
    url: 'www.producthunt.com/',
};

async function handler() {
    const response = await ofetch('https://www.producthunt.com/', {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response);
    const match = $('script:contains("ApolloSSRDataTransport")')
        .text()
        .match(/"events":(\[.+\])\}\)/)?.[1]
        ?.trim()
        .replaceAll('undefined', 'null');

    const data = JSON.parse(match);
    const todayList = data.find((event) => event.type === 'next' && event.value.data.homefeed).value.data.homefeed.edges.find((edge) => edge.node.id === 'FEATURED-0').node;
    // 0: Top Products Launching Today
    // 1: Yesterday's Top Products
    // 2: Last Week's Top Products
    // 3: Last Month's Top Products

    const list = todayList.items
        .filter((i) => i.__typename === 'Post')
        .map((item) => ({
            title: item.name,
            link: `https://www.producthunt.com/products/${item.product.slug}`,
            postSlug: item.slug,
            description: item.tagline,
            pubDate: parseDate(item.createdAt),
            image: `https://ph-files.imgix.net/${item.thumbnailImageUuid}`,
            categories: item.topics.edges.map((topic) => topic.node.name),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch('https://www.producthunt.com/frontend/graphql', {
                    method: 'POST',
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                    body: {
                        operationName: 'PostPage',
                        variables: {
                            slug: item.postSlug,
                        },
                        extensions: {
                            persistedQuery: {
                                version: 1,
                                sha256Hash: '488585149898ee974a51884b11e205c34ea8ad34ee01d47d7936a66a6db799ff',
                            },
                        },
                    },
                });
                const post = response.data.post;

                item.author = post.user.name;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    tagline: post.tagline,
                    description: post.description,
                    media: post.media,
                });

                return item;
            })
        )
    );

    return {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        item: items,
    };
}
