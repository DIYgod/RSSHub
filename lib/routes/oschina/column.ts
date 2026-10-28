import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getLimit, getNews } from './utils';

interface NewsResponse {
    code: number;
    message: string;
    result: {
        id: number;
        title: string;
        detail: string;
        pubTime: string;
        lastUpdate: string | null;
        tags: string | null;
        coverUrl: string;
        userVo: { name: string; spaceUrl: string; portraitUrl: string };
    };
}

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit = getLimit(ctx.req.query('limit'), 10);
    const baseUrl = 'https://www.oschina.net';
    const targetUrl = new URL(`news/column?columnId=${id}`, baseUrl).href;
    const response = await ofetch(targetUrl);
    const $ = load(response);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;
    const list = $('div.news-item')
        .slice(0, limit)
        .toArray()
        .flatMap((element) => {
            const link = $(element).attr('data-url');
            return link ? { link: new URL(link, baseUrl).href } : [];
        });
    const items: DataItem[] = await pMap(
        list,
        async (item) => {
            const newsId = new URL(item.link).pathname.split('/', 3)[2];
            const details = await cache.tryGet(`oschina:column:news:${newsId}`, async () => {
                const response: NewsResponse = await getNews(Number(newsId));
                if (response.code !== 200) {
                    throw new Error(`Unable to fetch OSCHINA news ${newsId}: ${response.message}`);
                }
                const news = response.result;
                return {
                    title: news.title,
                    description: news.detail,
                    pubDate: timezone(parseDate(news.pubTime), 8),
                    updated: news.lastUpdate ? parseDate(news.lastUpdate) : undefined,
                    category: news.tags ? news.tags.split(',') : undefined,
                    author: [{ name: news.userVo.name, url: news.userVo.spaceUrl, avatar: news.userVo.portraitUrl }],
                    image: news.coverUrl,
                    guid: `oschina:news:${news.id}`,
                };
            });
            return { ...details, link: item.link, language };
        },
        { concurrency: 3 }
    );
    const author = $('a.logo').attr('title');
    return {
        title: `${author} - ${$('div#tabDropdownListOpen a.selected').text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('a.logo img').attr('src'),
        author,
        language,
        id: $('val[data-name="weixinShareUrl"]').attr('data-value'),
    };
};

export const route: Route = {
    path: '/column/:id',
    name: '专栏',
    url: 'www.oschina.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/oschina/column/14',
    parameters: {
        id: '专栏 id，可在对应专栏页 URL 中找到',
    },
    description: `::: tip
若订阅 [开源安全专栏](https://www.oschina.net/news/column?columnId=14)，网址为 \`https://www.oschina.net/news/column?columnId=14\`，请截取 \`https://www.oschina.net/news/column?columnId=\` 到末尾的部分 \`14\` 作为 \`id\` 参数填入，此时目标路由为 [\`/oschina/column/14\`](https://rsshub.app/oschina/column/14)。
:::

<details>
<summary>更多专栏</summary>

| 名称            | ID |
| --------------- | -- |
| 古典主义 Debian | 4  |
| 自由 & 开源     | 5  |
| 溯源            | 6  |
| 开源先懂协议    | 7  |
| 开源变局        | 8  |
| 创造者说        | 9  |
| 精英主义 BSD    | 10 |
| 苹果有开源      | 11 |
| 开源访谈        | 12 |
| 抱团找组织      | 13 |
| 开源安全        | 14 |
| OSPO            | 15 |
| 创业小辑        | 16 |
| 星推荐          | 17 |
| 单口开源        | 18 |
| 编辑部观察直播  | 19 |
| 开源商业化      | 20 |
| ChatGPT 专题    | 21 |
| 开源新思        | 24 |
| 开源日报        | 25 |
| 大模型思辨      | 26 |
| 家里有个程序员  | 27 |
| 开源漫谈        | 23 |

</details>`,
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Articles,
};
