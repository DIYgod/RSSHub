import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/sspai/index',
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
            source: ['sspai.com/index'],
        },
    ],
    name: '首页',
    maintainers: ['HenryQW'],
    handler,
    url: 'sspai.com/index',
};

async function handler() {
    const api_url = 'https://sspai.com/api/v1/article/index/page/get?limit=10&offset=0&created_at=0';
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const items = await Promise.all(
        resp.data.data.map((item) => {
            const link = `https://sspai.com/api/v1/${item.slug ? `member/article/single/info/get?slug=${item.slug}` : `article/info/get?id=${item.id}`}&view=second&support_webp=true`;
            let description = '';

            const key = `sspai: ${item.id}`;
            return cache.tryGet(key, async () => {
                const response = await got({ method: 'get', url: link });
                const articleData = response.data.data;
                const banner = articleData.promote_image;
                if (banner) {
                    description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                }
                description += articleData.body;

                return {
                    title: item.title.trim(),
                    description,
                    link: `https://sspai.com/post/${item.id}`,
                    pubDate: parseDate(item.released_time * 1000),
                    author: item.author.nickname,
                };
            });
        })
    );

    return {
        title: '少数派',
        link: 'https://sspai.com',
        description: '少数派首页',
        item: items,
    };
}
