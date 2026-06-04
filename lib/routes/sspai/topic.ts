import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media'],
    example: '/sspai/topic/250',
    parameters: { id: '专题 id，可在专题主页URL中找到' },
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
            source: ['sspai.com/topic/:id'],
        },
    ],
    name: '专题内文章更新',
    maintainers: ['SunShinenny'],
    handler,
};

async function handler(ctx) {
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
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
            const itemUrl = `https://sspai.com/post/${item.id}`;
            const author = item.author.nickname;

            if (topic_title === '') {
                topic_title = item.topics[0].title;
                topic_link = `https://sspai.com/topic/${id}`;
                topic_des = item.topics[0].intro;
            }
            return cache.tryGet(`sspai: ${item.id}`, async () => {
                const response = await got(link);
                let description = '';
                const articleData = response.data.data;
                const banner = articleData.promote_image;
                if (banner) {
                    description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                }
                description += articleData.body;

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

    return {
        title: `少数派专题-${topic_title}`,
        link: topic_link,
        description: topic_des,
        item: out,
    };
}
