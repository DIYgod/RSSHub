import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?/:type?',
    categories: ['blog'],
    example: '/kenshin',
    parameters: { category: '分类，见下表，默认为首页', type: '子分类，见下表，默认为首页' },
    name: '分类',
    maintainers: ['nczitzk'],
    description: `::: tip
如 \`藝能新聞\` 的 \`日劇新聞\` 分类，路由为 \`/jnews/news_drama\`
:::

藝能新聞 jnews

| 日劇新聞    | 日影新聞    | 日樂新聞    | 日藝新聞            |
| ----------- | ----------- | ----------- | ------------------- |
| news\\_drama | news\\_movie | news\\_music | news\\_entertainment |

| 動漫新聞  | 藝人美照     | 清涼寫真   | 日本廣告 | 其他日聞     |
| --------- | ------------ | ---------- | -------- | ------------ |
| news\\_acg | artist-photo | photoalbum | jpcm     | news\\_others |

旅遊情報 jpnews

| 日本美食情報 | 日本甜點情報  | 日本零食情報  | 日本飲品情報  | 日本景點情報       |
| ------------ | ------------- | ------------- | ------------- | ------------------ |
| jpnews-food  | jpnews-sweets | jpnews-okashi | jpnews-drinks | jpnews-attractions |

| 日本玩樂情報 | 日本住宿情報 | 日本活動情報  | 日本購物情報    | 日本社會情報   |
| ------------ | ------------ | ------------- | --------------- | -------------- |
| jpnews-play  | jpnews-hotel | jpnews-events | jpnews-shopping | jpnews-society |

| 日本交通情報   | 日本天氣情報   |
| -------------- | -------------- |
| jpnews-traffic | jpnews-weather |

日劇世界 jdrama

| 每周劇評              | 日劇總評             | 資料情報    |
| --------------------- | -------------------- | ----------- |
| drama\\_review\\_weekly | drama\\_review\\_final | drama\\_data |

| 深度日劇    | 收視報告      | 日劇專欄      | 劇迷互動           |
| ----------- | ------------- | ------------- | ------------------ |
| drama\\_deep | drama\\_rating | drama\\_column | drama\\_interactive |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = '', type = '' } = ctx.req.param();

    const rootUrl = 'https://kenshin.hk';
    const currentUrl = `${rootUrl}${category && type ? `/category/${category}/${type}` : ''}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.entry-title a')
        .toArray()
        .slice(0, 10)
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href')!,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                content('.fb-comments').prev().remove();
                content('.code-block, .fb-comments').remove();

                item.description = content('.entry-content').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content')!);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
