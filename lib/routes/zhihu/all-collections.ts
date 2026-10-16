import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';

import { generateData } from './pin/utils';
import type { Collection, CollectionItem } from './types';
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

function generateCollectionItem(item: CollectionItem): DataItem & { link: string } {
    const content = item.content;
    const data =
        content.type === 'pin'
            ? generateData([content])[0]
            : {
                  title: (content.type === 'article' || content.type === 'zvideo' ? content.title : content.question!.title)!,
                  link: content.url,
                  description: content.type === 'zvideo' ? `<img src=${content.video!.url}/>` : content.content,
                  pubDate: parseDate((content.type === 'article' ? content.updated : content.updated_time)! * 1000),
              };
    return { ...data, guid: data.link, category: [item.collectionTitle!] };
}

async function handler(ctx) {
    const id = ctx.req.param('id');
    const apiPath = `https://api.zhihu.com/people/${id}/collections`;

    const response = await got(apiPath, {
        headers: {
            cookie: config.zhihu.cookies,
            Referer: `https://www.zhihu.com/people/${id}/collections`,
        },
    });

    const collections: Collection[] = response.data.data;
    const sessionKey = md5(config.zhihu.cookies ?? '');

    const allCollectionItems = await pMap(
        collections,
        async (collection) => {
            const items = await cache.tryGet<CollectionItem[]>(`zhihu:all-collections:first-page:v1:${sessionKey}:${collection.id}`, async () => {
                const response = await got(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=0&limit=20`, {
                    headers: {
                        ...header,
                        cookie: config.zhihu.cookies,
                        Referer: `https://www.zhihu.com/collection/${collection.id}`,
                    },
                });
                if (!Array.isArray(response.data.data)) {
                    throw new TypeError(`Zhihu collection ${collection.id} did not return a first-page list.`);
                }
                return response.data.data;
            });

            return {
                collectionId: collection.id,
                collectionTitle: collection.title,
                items,
            };
        },
        { concurrency: 3 }
    );

    const items = allCollectionItems.flatMap((collection) =>
        collection.items.map((item) => ({
            ...item,
            collectionTitle: collection.collectionTitle,
        }))
    );
    const uniqueItems = new Map<string, DataItem & { link: string }>();
    for (const item of items) {
        const data = generateCollectionItem(item);
        const previous = uniqueItems.get(data.link);
        if (previous) {
            previous.category = [...new Set([...(previous.category ?? []), ...(data.category ?? [])])];
        } else {
            uniqueItems.set(data.link, data);
        }
    }

    return {
        title: `${collections[0].creator.name}的知乎收藏`,
        link: `https://www.zhihu.com/people/${id}/collections`,
        item: uniqueItems.values().toArray(),
    };
}
