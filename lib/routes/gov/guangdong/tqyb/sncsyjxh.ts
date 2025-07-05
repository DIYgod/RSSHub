import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'http://www.tqyb.com.cn';

export const route: Route = {
    path: '/guangdong/tqyb/sncsyjxh',
    categories: ['forecast'],
    example: '/gov/guangdong/tqyb/sncsyjxh',
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

async function handler() {
    const sncsyjxhJsUrl = `${rootUrl}/data/gzWeather/otherCityAlarm.js`;

    const response = await got.get(sncsyjxhJsUrl);
    const resData = JSON.parse(String(response.data.match(/Alarm = (.*?);/)[1]));

    const data = [];
    for (const i in resData) {
        for (const j in resData[i]) {
            data.push(resData[i][j]);
        }
    }

    const items = data.map((item) => ({
        title: item.cname + ' ' + item.sigtypename,
        link: `http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/`,
        description: art(path.join(__dirname, './templates/sncsyjxh.art'), {
            item,
        }),
        pubDate: timezone(parseDate(item.datetime, 'YYYY年MM月DD日 HH:mm'), +8),
        guid: timezone(parseDate(item.datetime, 'YYYY年MM月DD日 HH:mm'), +8) + item.cname + item.sigtypename,
    }));

    return {
        title: '广东省内城市预警信号',
        link: `http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/`,
        item: items,
    };
}
