import { renderToString } from 'hono/jsx/dom/server';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:column',
    categories: ['multimedia'],
    example: '/cntv/TOPC1451528971114112',
    parameters: { column: '栏目ID, 可在对应CNTV栏目页面找到' },
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
            source: ['navi.cctv.com/'],
        },
    ],
    name: '栏目',
    maintainers: ['WhoIsSure', 'Fatpandac'],
    handler,
    url: 'navi.cctv.com/',
    description: `::: tip
栏目 ID 查找示例:
打开栏目具体某一期页面，F12 控制台输入\`column_id\`得到栏目 ID。
:::

栏目

| 新闻联播             | 新闻周刊             | 天下足球             |
| -------------------- | -------------------- | -------------------- |
| TOPC1451528971114112 | TOPC1451559180488841 | TOPC1451551777876756 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('column');
    const limit = getRouteLimit(ctx, 25);

    const response = await got({
        method: 'get',
        url: `https://api.cntv.cn/NewVideo/getVideoListByColumn?id=${id}&n=${limit}&sort=desc&p=1&mode=0&serviceId=tvcctv`,
    });
    const data = response.data.data?.list;
    if (!data?.length) {
        throw new NotFoundError('No videos found for this CNTV column. Check the column ID on a programme episode page.');
    }
    const name = data[0].title.match(/《(.*?)》/)[1];

    return {
        title: `CNTV 栏目 - ${name}`,
        description: `${name} 栏目的视频更新`,
        item: data.map((item) => ({
            title: item.title,
            description: renderToString(
                <>
                    <p>{item.brief}</p>
                    <p>时长：{item.length}</p>
                    <p>
                        <img src={item.image} />
                    </p>
                    <p>
                        <a href={item.url}>在线观看</a>
                    </p>
                </>
            ),
            pubDate: timezone(parseDate(item.time, 'YYYY-MM-DD HH:mm:ss'), 8),
            link: item.url,
        })),
    };
}
