import { config } from '@/config';
import type { Collection, CollectionItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { header } from './utils';

export const route: Route = {
    path: '/people/allCollections/:id',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/zhihu/people/allCollections/87-44-49-67',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/people/:id'],
            // target: 'people/allCollections/:id',
        },
    ],
    name: '用户全部收藏内容',
    maintainers: ['Healthyyue'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const apiPath = `https://api.zhihu.com/people/${id}/collections`;

    const response = await got(apiPath, {
        headers: {
            cookie: config.zhihu.cookies,
            Referer: `https://www.zhihu.com/people/${id}/collections`,
        },
    });

    const collections = response.data.data as Collection[];

    const allCollectionItems = await Promise.all(
        collections.map(async (collection) => {
            const firstPageResponse = await got(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=0&limit=20`, {
                headers: {
                    ...header,
                    cookie: config.zhihu.cookies,
                    Referer: `https://www.zhihu.com/collection/${collection.id}`,
                },
            });

            const {
                data: items,
                paging: { totals },
            } = firstPageResponse.data;

            if (totals > 20) {
                const offsetList = Array.from({ length: Math.ceil(totals / 20) - 1 }, (_, index) => (index + 1) * 20);

                const otherPages = await Promise.all(
                    offsetList.map((offset) =>
                        cache.tryGet(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=${offset}&limit=20`, async () => {
                            const response = await got(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=${offset}&limit=20`, {
                                headers: {
                                    ...header,
                                    cookie: config.zhihu.cookies,
                                    Referer: `https://www.zhihu.com/collection/${collection.id}`,
                                },
                            });
                            return response.data.data;
                        })
                    )
                );

                items.push(...otherPages.flat());
            }

            return {
                collectionId: collection.id,
                collectionTitle: collection.title,
                items,
            };
        })
    );

    const items = allCollectionItems.flatMap(
        (collection) =>
            collection.items.map((item) => ({
                ...item,
                collectionTitle: collection.collectionTitle,
            })) as CollectionItem[]
    );

    return {
        title: `${collections[0].creator.name}的知乎收藏`,
        link: `https://www.zhihu.com/people/${id}/collections`,
        item: items.map((item) => {
            const content = item.content;

            return {
                title: content.type === 'article' || content.type === 'zvideo' ? content.title : content.question.title,
                link: content.url,
                description: content.type === 'zvideo' ? `<img src=${content.video.url}/>` : content.content,
                pubDate: parseDate((content.type === 'article' ? content.updated : content.updated_time) * 1000),
                category: [item.collectionTitle],
            };
        }),
    };
}
