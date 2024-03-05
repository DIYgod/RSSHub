// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const api_url = 'https://sspai.com/api/v1/article/index/page/get?limit=10&offset=0&created_at=0';
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const items = await Promise.all(
        resp.data.data.map((item) => {
            const link = `https://sspai.com/api/v1/${item.slug ? `member/article/single/info/get?slug=${item.slug}` : `article/info/get?id=${item.id}`}&view=second`;
            let description = '';

            const key = `sspai: ${item.id}`;
            return cache.tryGet(key, async () => {
                const response = await got({ method: 'get', url: link });
                description = response.data.data.body;

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

    ctx.set('data', {
        title: '少数派 -- 首页',
        link: 'https://sspai.com',
        description: '少数派 -- 首页',
        item: items,
    });
};
