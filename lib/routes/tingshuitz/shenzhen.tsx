import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/shenzhen',
    categories: ['forecast'],
    example: '/tingshuitz/shenzhen',
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
            source: ['sz-water.com.cn/*'],
        },
    ],
    name: '深圳市',
    maintainers: ['lilPiper'],
    handler,
    url: 'sz-water.com.cn/*',
    description: `可能仅限中国大陆服务器访问，以实际情况为准。`,
};

async function handler() {
    const url = 'https://szgk.sz-water.com.cn/api/wechat/op/getStopWaterNotice';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data.data;

    return {
        title: '停水通知 - 深圳水务',
        link: 'https://www.sz-water.com.cn/',
        item: data.map((item) => ({
            title: `${item.position}${item.stoptime}`,
            description: renderToString(
                <>
                    <p>{item.title}</p>
                    <p>
                        {item.reginName ? `【${item.reginName}】` : null}
                        (影响用户{item.affectUser}),
                        {item.stopwaterType ? ` [${item.stopwaterType}]` : null}
                        原因：{item.reason},停水开始时间{item.stopStartTime},停水结束时间{item.stopEndTime}
                    </p>
                </>
            ),
            pubDate: timezone(parseDate(item.createdOn, 'YYYY-MM-DD HH:mm:ss'), +8),
            link: 'https://szgk.sz-water.com.cn/wechat_web/Water_stop.html',
            guid: `${item.position}${item.stopStartTime}`,
        })),
    };
}
