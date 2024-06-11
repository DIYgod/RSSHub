import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tag/:keyword',
    categories: ['new-media'],
    example: '/sspai/tag/apple',
    parameters: { keyword: '关键词' },
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
            source: ['sspai.com/tag/:keyword'],
        },
    ],
    name: '标签订阅',
    maintainers: ['Jeason0228'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const keyword_encode = encodeURIComponent(decodeURIComponent(keyword));
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=50&has_tag=1&tag=${keyword_encode}&include_total=false`;
    const host = `https://beta.sspai.com/tag/${keyword_encode}`;
    const resp = await got({
        method: 'get',
        url: api_url,
        headers: {
            Referer: host,
        },
    });
    const data = resp.data.list;
    const items = await Promise.all(
        data.map((item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            let description;
            const key = `sspai: ${item.id}`;
            return cache.tryGet(key, async () => {
                const response = await got({ method: 'get', url: link, headers: { Referer: host } });
                // description = response.data.data.body;
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
                    pubDate: parseDate(item.released_at * 1000),
                    author: item.author.nickname,
                };
            });
        })
    );
    return {
        title: `#${keyword} - 少数派`,
        link: host,
        description: `${keyword} 更新推送 `,
        item: items,
    };
}
