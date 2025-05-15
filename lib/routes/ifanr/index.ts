import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index',
    categories: ['new-media', 'popular'],
    view: ViewType.Articles,
    example: '/ifanr/index',
    parameters: {},
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
            source: ['www.ifanr.com/index'],
        },
    ],
    name: '首页',
    maintainers: ['donghongfei'],
    handler,
    url: 'www.ifanr.com/index',
};

async function handler() {
    const apiUrl = 'https://sso.ifanr.com/api/v5/wp/web-feed/?limit=20&offset=0';
    const resp = await got({
        method: 'get',
        url: apiUrl,
    });
    const items = await Promise.all(
        resp.data.objects.map((item) => {
            const link = `https://sso.ifanr.com/api/v5/wp/article/?post_id=${item.post_id}`;
            let description = '';

            const key = `ifanr:${item.id}`;

            return cache.tryGet(key, async () => {
                const response = await got({ method: 'get', url: link });
                const articleData = response.data.objects[0];
                const banner = articleData.post_cover_image;
                if (banner) {
                    description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                }
                description += articleData.post_content;

                return {
                    title: item.post_title.trim(),
                    description,
                    link: item.post_url,
                    pubDate: parseDate(item.created_at * 1000),
                    author: item.created_by.name,
                };
            });
        })
    );

    return {
        title: '爱范儿',
        link: 'https://www.ifanr.com',
        description: '爱范儿首页',
        item: items,
    };
}
