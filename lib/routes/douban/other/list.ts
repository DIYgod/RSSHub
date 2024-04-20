import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import path from 'node:path';
import { art } from '@/utils/render';
import { fallback, queryToInteger } from '@/utils/readable-social';

export const route: Route = {
    path: '/list/:type?/:routeParams?',
    categories: ['social-media'],
    example: '/douban/list/subject_real_time_hotest',
    parameters: { type: '榜单类型，见下表。默认为实时热门书影音', routeParams: '额外参数；请参阅以下说明和表格' },
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
            source: ['www.douban.com/subject_collection/:type'],
            target: '/list/:type',
        },
    ],
    name: '豆瓣榜单与集合',
    maintainers: ['5upernova-heng', 'honue'],
    handler,
    description: `| 榜单 / 集合        | 路由                          |
  | ------------------ | ----------------------------- |
  | 实时热门书影音     | subject\_real\_time\_hotest   |
  | 影院热映           | movie\_showing                |
  | 实时热门电影       | movie\_real\_time\_hotest     |
  | 实时热门电视       | tv\_real\_time\_hotest        |
  | 一周口碑电影榜     | movie\_weekly\_best           |
  | 华语口碑剧集榜     | tv\_chinese\_best\_weekly     |
  | 全球口碑剧集榜     | tv\_global\_best\_weekly      |
  | 国内口碑综艺榜     | show\_chinese\_best\_weekly   |
  | 国外口碑综艺榜     | show\_global\_best\_weekly    |
  | 热播新剧国产剧     | tv\_domestic                  |
  | 热播新剧欧美剧     | tv\_american                  |
  | 热播新剧日剧       | tv\_japanese                  |
  | 热播新剧韩剧       | tv\_korean                    |
  | 热播新剧动画       | tv\_animation                 |
  | 虚构类小说热门榜   | book\_fiction\_hot\_weekly    |
  | 非虚构类小说热门榜 | book\_nonfiction\_hot\_weekly |
  | 热门单曲榜         | music\_single                 |
  | 华语新碟榜         | music\_chinese                |
  | ...                | ...                           |

  | 额外参数 | 含义                   | 接受的值 | 默认值 |
  | -------- | ---------------------- | -------- | ------ |
  | playable | 仅看有可播放片源的影片 | 0/1      | 0      |
  | score    | 筛选评分               | 0-10     | 0      |

  用例：\`/douban/list/tv_korean/playable=1&score=8\`

  > 上面的榜单 / 集合并没有列举完整。
  >
  > 如何找到榜单对应的路由参数：
  > 在豆瓣手机 APP 中，对应地榜单页面右上角，点击分享链接。链接路径 \`subject_collection\` 后的路径就是路由参数 \`type\`。
  > 如：小说热门榜的分享链接为：\`https://m.douban.com/subject_collection/ECDIHUN4A\`，其对应本 RSS 路由的 \`type\` 为 \`ECDIHUN4A\`，对应的订阅链接路由：[\`/douban/list/ECDIHUN4A\`](https://rsshub.app/douban/list/ECDIHUN4A)`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'subject_real_time_hotest';
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const playable = fallback(undefined, queryToInteger(routeParams.playable), 0);
    const score = fallback(undefined, queryToInteger(routeParams.score), 0);
    let start = 0;
    const count = 50;
    let items = [];
    let title = '';
    let description = '';
    let total = null;
    while (total === null || start < total) {
        const url = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}/items?playable=${playable}&start=${start}&count=${count}`;
        // eslint-disable-next-line no-await-in-loop
        const response = await got({
            method: 'get',
            url,
            headers: {
                Referer: `https://m.douban.com/subject_collection/${type}`,
            },
        });
        title = response.data.subject_collection.name;
        description = response.data.subject_collection.description;
        total = response.data.total;
        const newItems = response.data.subject_collection_items
            .filter((item) => {
                const rate = item.rating ? item.rating.value : 0;
                return rate >= score; // 保留rate大于等于score的项and过滤无评分项
            })
            .map((item) => {
                const title = item.title;
                const link = item.url;
                const description = art(path.join(__dirname, '../templates/list_description.art'), {
                    ranking_value: item.ranking_value,
                    title,
                    original_title: item.original_title,
                    rate: item.rating ? item.rating.value : null,
                    card_subtitle: item.card_subtitle,
                    description: item.cards ? item.cards[0].content : item.abstract,
                    cover: item.cover_url || item.cover?.url,
                });
                return {
                    title,
                    link,
                    description,
                };
            });
        items = [...items, ...newItems];
        start += count;
    }

    return {
        title: `豆瓣 - ${title}`,
        link: `https://m.douban.com/subject_collection/${type}`,
        item: items,
        description,
    };
}
