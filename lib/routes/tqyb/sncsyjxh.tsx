import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.tqyb.com.cn';

export const route: Route = {
    path: '/sncsyjxh',
    categories: ['forecast'],
    example: '/tqyb/sncsyjxh',
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
            source: ['www.tqyb.com.cn/gz/weatherAlarm/otherCity/'],
        },
    ],
    name: '广东省内城市预警信号',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.tqyb.com.cn/gz/weatherAlarm/otherCity/',
};

function parsePubDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(`${value} +08:00`, 'YYYY年MM月DD日 HH:mm Z');
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler() {
    const sncsyjxhJsUrl = `${rootUrl}/data/gzWeather/otherCityAlarm.js`;

    const response = await got.get(sncsyjxhJsUrl);
    const resData = JSON.parse(String(response.data.match(/Alarm = (.*?);/)[1]));

    const data: any[] = [];
    for (const i in resData) {
        for (const j in resData[i]) {
            data.push(resData[i][j]);
        }
    }

    const items = data.map((item) => ({
        title: item.cname + ' ' + item.sigtypename,
        link: 'http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/',
        description: renderToString(
            <>
                <text>地区： {item.cname} </text>
                <br />
                <text>等级： {item.sigtypename} </text>
            </>
        ),
        pubDate: parsePubDate(item.datetime),
        guid: `weather-alert:${item.obtid}:${item.signame}:${item.sigcolor}:${item.datetime}`,
    }));

    return {
        title: '广东省内城市预警信号',
        link: 'http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/',
        item: items,
    };
}
