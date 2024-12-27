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
        antiCrawler: true,
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
    const name_encode = encodeURIComponent(decodeURIComponent(name));
    const api_url = `https://sso.ifanr.com/api/v5/wp/article/?post_category=${name_encode}&limit=10&offset=0`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const items = await Promise.all(
        resp.data.objects.map((item) => {
            let description = '';

            const key = `ifanr: ${item.id}`;

            // eslint-disable-next-line require-await
            return cache.tryGet(key, async () => {
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
                    author: item.created_by.name,
                    source: 'iFanr 爱范儿',
                };
            });
        })
    );

    return {
        title: `#${name} - iFanr 爱范儿`,
        link: 'https://www.ifanr.com/category/',
        description: `${name} 更新推送 `,
        item: items,
    };
}
