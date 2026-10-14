import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { rootUrl } from './utils';

const titles = {
    280: '最新',
    333: '新品',
    331: 'DeFi',
    334: 'NFT',
    332: '存储',
    330: '波卡',
    297: '行情',
    296: '活动',
};

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/odaily',
    parameters: { id: 'id，见下表，默认为最新' },
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
            source: ['www.odaily.news/', 'www.odaily.news/:locale/post'],
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.odaily.news/zh-CN/post',
    description: `| 最新 | 新品 | DeFi | NFT | 存储 | 波卡 | 行情 | 活动 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- |
| 280  | 333  | 331  | 334 | 332  | 330  | 297  | 296  |`,
};

type CurrentPost = {
    id: number;
    title: string;
    summary: string;
    publishTimestamp: number;
    tags: Array<{ name: string }>;
};
type CurrentPostDetail = { content: string; author?: { nickname: string } };

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '280';

    if (id === '280') {
        const query = new URLSearchParams({ page: '1', size: String(getRouteLimit(ctx, 25)) });
        const response = await ofetch<{ data: { list: CurrentPost[] } }>(`https://web-api.odaily.news/post/page?${query}`);
        const items = await pMap(
            response.data.list,
            async (item) => {
                const link = `${rootUrl}/post/${item.id}`;
                const detail = await cache.tryGet(link + ':body', async () => {
                    const response = await ofetch<{ data: CurrentPostDetail }>(`https://web-api.odaily.news/post/detail/${item.id}`);
                    return { description: response.data.content, author: response.data.author?.nickname };
                });
                return { title: item.title, link, pubDate: parseDate(item.publishTimestamp), category: item.tags.map((tag) => tag.name), ...detail };
            },
            { concurrency: 3 }
        );
        return { title: `${titles[id]} - Odaily星球日报`, link: rootUrl, item: items };
    }

    const currentUrl = `${rootUrl}/api/pp/api/app-front/feed-stream?feed_id=${id}&b_id=&per_page=${getRouteLimit(ctx, 25)}`;

    const response = await got(currentUrl);

    let items = response.data.data.items
        .map((item) => ({
            title: item.title,
            type: item.entity_type,
            description: `<p>${item.summary}</p>`,
            link: `${rootUrl}/${item.entity_type}/${item.entity_id}`,
            pubDate: timezone(parseDate(item.published_at), 8),
        }))
        .filter((item) => item.type !== 'newsflash');

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const ssr = JSON.parse(`{${detailResponse.data.match(/window\.__INITIAL_STATE__ = \{(.*)\}/)[1]}}`);

                const content = load(ssr.post.detail.content, null, false);
                content('img').each((_, img) => {
                    img.attribs.src = img.attribs.src.split('?x-oss-process', 1)[0];
                    img.attribs.src = img.attribs.src.split('!heading', 1)[0];
                });

                item.description = content.html();
                item.author = ssr.post.user.name;

                delete item.type;

                return item;
            })
        )
    );

    return {
        title: `${titles[id]} - Odaily星球日报`,
        link: rootUrl,
        item: items,
    };
}
