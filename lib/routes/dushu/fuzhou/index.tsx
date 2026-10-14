import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://gateway-api-ipv4.dushu365.com/compose-orch/offlineActivity/v100/activity/list';
const itemLink = 'https://card.dushu.io/requirement/offline-activity/activity-detail/v/index.html';
const link = 'https://card.dushu.io/requirement/offline-activity/host-home/v/index.html?webview-type=rn&hostId=xtntzsnwsnkw511r';

const eventTimeFormat = new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
    hour12: false,
});
const formatEventTime = (time: number) => eventTimeFormat.format(parseDate(time));

export const route: Route = {
    path: '/fuzhou',
    categories: ['new-media'],
    example: '/dushu/fuzhou',
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
            source: ['www.dushu365.com/'],
            target: '/fuzhou',
        },
    ],
    name: '樊登福州运营中心',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.dushu365.com',
};

async function handler() {
    const response = await ofetch(host, {
        method: 'POST',
        body: {
            channelTid: 'xtntzsnwsnkw511r',
            pageNo: 1,
            pageSize: 10,
            type: 0,
        },
    });

    const data = response.data.activityListVOS;

    return {
        title: '樊登福州运营中心',
        link,
        item: data.map((item) => ({
            title: item.activityName,
            pubDate: parseDate(item.startTime),
            link: itemLink + '?productId=' + item.activityId + '&type=' + item.type,
            description: renderToString(
                <>
                    <text>{`地区：${item.areaName}`}</text>
                    <br />
                    <text>{`地点：${item.address}`}</text>
                    <br />
                    <text>{`开始时间： ${formatEventTime(item.startTime)}`}</text>
                    <br />
                    <text>{`结束时间： ${formatEventTime(item.endTime)}`}</text>
                    <br />
                    <img style="heigth:500px;width:500px" src={item.posterImg} />
                </>
            ),
        })),
    };
}
