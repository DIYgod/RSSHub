// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const api_url = 'https://sspai.com/api/v1/articles?offset=0&limit=20&is_matrix=1&sort=matrix_at&include_total=false';
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    const items = await Promise.all(
        data.map((item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            let description = '';

            const key = `sspai: ${item.id}`;
            return cache.tryGet(key, async () => {
                const response = await got(link);
                description = response.data.data.body;

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

    ctx.set('data', {
        title: '少数派 -- Matrix',
        link: 'https://sspai.com/matrix',
        description: '少数派 -- Matrix',
        item: items,
    });
};
