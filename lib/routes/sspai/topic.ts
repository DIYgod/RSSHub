// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=20&topic_id=${id}&sort=created_at&include_total=false`;
    const response = await got({
        method: 'get',
        url: api_url,
    });
    const list = response.data.list;
    let topic_title = '';
    let topic_link = '';
    let topic_des = '';
    const out = await Promise.all(
        list.map((item) => {
            const title = item.title;
            const date = item.created_at;
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            const itemUrl = `https://sspai.com/post/${item.id}`;
            const author = item.author.nickname;

            if (topic_title === '') {
                topic_title = item.topics[0].title;
                topic_link = `https://sspai.com/topic/${id}`;
                topic_des = item.topics[0].intro;
            }
            return cache.tryGet(`sspai: ${item.id}`, async () => {
                const response = await got(link);
                const description = response.data.data.body;

                const single = {
                    title,
                    link: itemUrl,
                    author,
                    description,
                    pubDate: parseDate(date * 1000),
                };
                return single;
            });
        })
    );

    ctx.set('data', {
        title: `少数派专题-${topic_title}`,
        link: topic_link,
        description: topic_des,
        item: out,
    });
};
