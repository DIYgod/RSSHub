import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { header } from './utils';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/people/allCollections/:id',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/zhihu/people/allCollections/79-36-76-94',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
    features: {
        requireConfig: false,
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
    maintainers: ['CohenV'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    // 获取用户所有收藏夹内容
    const apiPath = `https://api.zhihu.com/people/${id}/collections`;
    // url 对应知乎曾经开放过的api，现在文档已经没有了，但还能用
    // 这是另一个版本 https://api.zhihu.com/collections/808180148/items?offset=0&limit=20
    // 以及 https://www.zhihu.com/api/v4/collections/${id}/items?offset=0&limit=20
    // 如果以上api都不能用了，以后只能从html中解析了

    // const signedHeader = await getSignedHeader(`https://www.zhihu.com/people/${id}`, apiPath);

    const response = await got(String(apiPath), {
        headers: {
            Referer: `https://www.zhihu.com/people/${id}/collections`,
        },
    });

    const collections = response.data.data;

    // 获取所有收藏夹中的所有文章
    const allCollectionItems = await Promise.all(
        collections.map(async (collection) => {
            // 首先获取第一页数据和总数
            const firstPageResponse = await got({
                method: 'get',
                url: `https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=0&limit=20`,
                headers: {
                    ...header,
                    Referer: `https://www.zhihu.com/collection/${collection.id}`,
                },
            });

            const items = firstPageResponse.data.data;
            const totals = firstPageResponse.data.paging.totals;

            // 如果有更多页，继续获取
            if (totals > 20) {
                const offsetList = [...Array.from({ length: Math.ceil(totals / 20) }).keys()].map((item) => item * 20).slice(1); // 从第二页开始

                const otherPages = await Promise.all(
                    offsetList.map((offset) =>
                        cache.tryGet(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=${offset}&limit=20`, async () => {
                            const response = await got({
                                method: 'get',
                                url: `https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=${offset}&limit=20`,
                                headers: {
                                    ...header,
                                    Referer: `https://www.zhihu.com/collection/${collection.id}`,
                                },
                            });
                            return response.data.data;
                        })
                    )
                );

                items.push(...otherPages.flat());
            }
            // console.log(`Collection ${collection.id}: Found ${items.length} items`);

            return {
                collectionId: collection.id,
                collectionTitle: collection.title,
                items,
            };
        })
    );

    // 处理所有收藏夹的数据
    const items = allCollectionItems.flatMap((collection) =>
        collection.items.map((item) =>
            // console.log('\n=== Original Item Data ===');
            // console.log('Original content:', item.content);

             ({
                ...item,
                collectionTitle: collection.collectionTitle,
            })
        )
    );

    return {
        title: `${collections[0].creator.name}的知乎收藏`,
        link: `https://www.zhihu.com/people/${id}/collections`,
        item: items.map((item) => {
            const content = item.content;
            // console.log('\n=== Data Transformation ===');
            // console.log('Before - url:', content.url);
            // console.log('Before - content:', content.content);

            const transformed = {
                title: content.type === 'article' || content.type === 'zvideo' ? content.title : content.question.title,
                link: content.url,
                description: content.type === 'zvideo' ? `<img src=${content.video.url}/>` : content.content,
                pubDate: parseDate((content.type === 'article' ? content.updated : content.updated_time) * 1000),
                collectionTitle: item.collectionTitle,
            };

            // console.log('After - link:', transformed.link);
            // console.log('After - description:', transformed.description);

            return transformed;
        }),
    };
}
