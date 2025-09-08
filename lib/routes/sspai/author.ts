import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function getUserId(slug) {
    const response = await got({
        method: 'get',
        url: `https://sspai.com/api/v1/user/slug/info/get?slug=${slug}`,
        headers: {
            Referer: `https://sspai.com/u/${slug}/posts`,
        },
    });

    if (response.data.error !== 0) {
        throw new InvalidParameterError('User Not Found');
    }

    return response.data.data.id;
}

export const route: Route = {
    path: '/author/:id',
    categories: ['new-media'],
    example: '/sspai/author/796518',
    parameters: { id: '作者 slug 或 id，slug 可在作者主页URL中找到，id 不易查找，仅作兼容' },
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
            source: ['sspai.com/u/:id/posts'],
        },
    ],
    name: '作者',
    maintainers: ['SunShinenny', 'hoilc'],
    handler,
};

async function handler(ctx) {
    const id = /^\d+$/.test(ctx.req.param('id')) ? ctx.req.param('id') : await getUserId(ctx.req.param('id'));
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=20&author_ids=${id}&include_total=false`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    const author_slug = data[0].author.slug;
    const author_nickname = data[0].author.nickname;
    const items = await Promise.all(
        data.map((item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
            let description = '';

            const key = `sspai: ${item.id}`;
            return cache.tryGet(key, async () => {
                const response = await got(link);
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
        title: `${author_nickname} - 少数派作者`,
        link: `https://sspai.com/u/${author_slug}/posts`,
        description: `${author_nickname} 更新推送 `,
        item: items,
    };
}
