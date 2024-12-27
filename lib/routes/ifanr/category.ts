import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:name',
    categories: ['new-media'],
    example: '/ifanr/category/早报',
    parameters: { name: '分类名称' },
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
            source: ['www.ifanr.com/category/:name'],
        },
    ],
    name: '分类',
    maintainers: ['donghongfei'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const name_encode = encodeURIComponent(name); // 已经是正确编码的，不需要 decodeURIComponent
    const api_url = `https://sso.ifanr.com/api/v5/wp/article/?post_category=${name_encode}&limit=10&offset=0`;

    try {
        const resp = await got({ method: 'get', url: api_url });

        const items = await Promise.all(
            resp.data.objects.map(async (item) => {
                let description = '';

                const key = `ifanr: ${item.id}`;

                // 异步获取缓存数据，注意需要在 tryGet 内部使用 await
                const data = await cache.tryGet(key, async () => {
                    const banner = item.post_cover_image;
                    if (banner) {
                        description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                    }
                    description += item.post_content;

                    return {
                        title: item.post_title.trim(),
                        description,
                        link: item.post_url,
                        pubDate: parseDate(item.created_at * 1000),
                        author: item.created_by ? item.created_by.name : 'Unknown', // 防止 created_by 为 null 或 undefined
                        source: 'iFanr 爱范儿',
                    };
                });

                return data; // 返回从缓存或网络获取的数据
            })
        );

        return {
            title: `#${name} - iFanr 爱范儿`,
            link: 'https://www.ifanr.com/category/',
            description: `${name} 更新推送 `,
            item: items,
        };
    } catch (error) {
        console.error('Error fetching articles:', error); // 如果您不希望在生产环境中使用 console，可以删除这一行
        return {
            title: `#${name} - iFanr 爱范儿`,
            link: 'https://www.ifanr.com/category/',
            description: `无法获取 ${name} 更新推送`,
            item: [],
        };
    }
}

