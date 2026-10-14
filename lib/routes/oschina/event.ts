import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { apiBaseUrl, getLimit } from './utils';

interface EventResponse {
    code: number;
    message: string;
    result: {
        id: number;
        topic: string;
        description: string;
        createTime: string;
        updateTime: string;
        imgUrl: string;
        province: string;
        city: string;
        userVo: { name: string; spaceUrl: string; portraitUrl: string };
    };
}

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'latest' } = ctx.req.param();
    const limit = getLimit(ctx.req.query('limit'), 30);
    const baseUrl = 'https://www.oschina.net';
    const targetUrl = new URL(`event?tab=${category}`, baseUrl).href;
    const response = await ofetch(new URL('action/ajax/get_more_event_list', baseUrl).href, {
        method: 'post',
        body: { tab: category },
    });
    const $ = load(response);
    const list = $('div.event-item')
        .slice(0, limit)
        .toArray()
        .flatMap((element) => {
            const item = $(element);
            const link = item.find('a.summary').attr('href') ?? /window\.open\(['"]([^'"]+)['"]/.exec(item.attr('onclick') ?? '')?.[1];
            return link ? { link: new URL(link, baseUrl).href } : [];
        });
    const items: DataItem[] = await pMap(
        list,
        async (item) => {
            const eventId = new URL(item.link).pathname.split('/', 3)[2];
            const details = await cache.tryGet(`oschina:event:details:${eventId}`, async () => {
                const response = await ofetch<EventResponse>(`${apiBaseUrl}/oschinapi/event/id`, { query: { id: eventId } });
                if (response.code !== 200) {
                    throw new Error(`Unable to fetch OSCHINA event ${eventId}: ${response.message}`);
                }
                const event = response.result;
                return {
                    title: event.topic,
                    description: event.description,
                    pubDate: timezone(parseDate(event.createTime), 8),
                    updated: timezone(parseDate(event.updateTime), 8),
                    image: event.imgUrl,
                    category: [event.province + event.city].filter(Boolean),
                    author: [{ name: event.userVo.name, url: event.userVo.spaceUrl, avatar: event.userVo.portraitUrl }],
                };
            });
            return { ...details, link: item.link };
        },
        { concurrency: 3 }
    );
    return {
        title: `OSCHINA - ${category === 'recommend' ? '强力推荐' : '最新活动'}`,
        link: targetUrl,
        item: items,
        language: 'zh-CN',
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/event/:category?',
    name: '活动',
    url: 'www.oschina.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/oschina/event',
    parameters: {
        category: '分类，默认为 `latest`，即最新活动，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [强力推荐](https://www.oschina.net/event?tab=recommend)，网址为 \`https://www.oschina.net/event?tab=recommend\`，请截取 \`https://www.oschina.net/event?tab=\` 到末尾的部分 \`recommend\` 作为 \`category\` 参数填入，此时目标路由为 [\`/oschina/event/recommend\`](https://rsshub.app/oschina/event/recommend)。
:::

| 强力推荐  | 最新活动 |
| --------- | -------- |
| recommend | latest   |`,
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '强力推荐',
            source: ['www.oschina.net/event'],
            target: '/event/recommend',
        },
        {
            title: '最新活动',
            source: ['www.oschina.net/event'],
            target: '/event/latest',
        },
    ],
    view: ViewType.Articles,
};
