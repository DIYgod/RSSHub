import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topics',
    categories: ['new-media'],
    example: '/sspai/topics',
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
            source: ['sspai.com/topics'],
        },
    ],
    name: '专题',
    maintainers: ['SunShinenny'],
    handler,
    url: 'sspai.com/topics',
    description: `此为专题广场更新提示 => 集合型而非单篇文章。与下方 "专题内文章更新" 存在明显区别！`,
};

async function handler() {
    const api_url = `https://sspai.com/api/v1/topics?offset=0&limit=20&include_total=false`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    const items = await Promise.all(
        data.map((item) => {
            const link = `https://sspai.com/topic/${item.id}`;
            let description = '';

            const key = `sspai:topics:${item.id}`;
            return cache.tryGet(key, () => {
                description = `<br><img src="https://cdnfile.sspai.com/${item.banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"/>${item.intro}<br>如有兴趣,请复制链接订阅 <br> <h3>https://rsshub.app/sspai/topic/${item.id}</h3>`;

                return {
                    title: item.title.trim(),
                    description,
                    link,
                    pubDate: parseDate(item.released_at * 1000),
                    author: item.author.nickname,
                };
            });
        })
    );

    return {
        title: `少数派专题广场更新推送`,
        link: `https://sspai.com/topics`,
        description: `仅仅推送新的专题(集合型而非具体文章) `,
        item: items,
    };
}
