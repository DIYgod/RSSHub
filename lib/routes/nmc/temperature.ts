import { Context } from 'hono';
import { Route, Data } from '@/types';
import { fetchImages } from './image';

export const route: Route = {
    path: '/observation/temperature/:frequency?',
    categories: ['forecast'],
    example: '/nmc/observation/temperature/hourly',
    parameters: { frequency: '数据频率，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '天气实况',
    maintainers: ['dousha'],
    handler,
    url: 'nmc.cn/publish/observations/index.html',
    description: `
| 频率 | 对应的值 |
| ---- | -------- |
| 逐时 | hourly |
| 逐日平均 | daily |
| 逐日最高 | daily-max |
| 逐日最低 | daily-min |
| 近 30 天最高气温 | max30d |
| 近 30 天最低气温 | min30d |
| 近 30 天平均气温 | avg30d |
`,
};

const urlLookup: Record<string, string> = {
    hourly: 'http://www.nmc.cn/publish/observations/hourly-temperature.html',
    daily: 'http://www.nmc.cn/publish/observations/day-temperature/avg.html',
    'daily-max': 'http://www.nmc.cn/publish/observations/day-temperature/max.html',
    'daily-min': 'http://www.nmc.cn/publish/observations/day-temperature/min.html',
    max30d: 'http://www.nmc.cn/publish/observations/high-30days.html',
    min30d: 'http://www.nmc.cn/publish/observations/low-30days.html',
    avg30d: 'http://www.nmc.cn/publish/observations/mta-30days.html',
};

const titleLookup: Record<string, string> = {
    hourly: '逐时气温',
    daily: '逐日平均气温',
    'daily-max': '逐日最高气温',
    'daily-min': '逐日最低气温',
    max30d: '近 30 天最高气温',
    min30d: '近 30 天最低气温',
    avg30d: '近 30 天平均气温',
};

async function handler(ctx: Context): Promise<Data> {
    const { frequency = 'hourly' } = ctx.req.param();
    const url = urlLookup[frequency];

    if (!url) {
        throw new Error(`Invalid frequency: ${frequency}`);
    }

    const title = `天气实况 - ${titleLookup[frequency]}`;
    const imageItem = await fetchImages(url, title);
    const data: Data = {
        title: '天气实况',
        link: url,
        description: '天气实况',
        item: imageItem,
    };

    return data;
}
