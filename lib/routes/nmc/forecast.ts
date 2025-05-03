import { Context } from 'hono';
import { Route, Data } from '@/types';
import { fetchForecastImage } from './image';

export const route: Route = {
    path: '/forecast/temperature/:type?',
    categories: ['forecast'],
    example: '/nmc/forecast/temperature/max',
    parameters: { type: '数据类型，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '气温预报',
    maintainers: ['dousha'],
    handler,
    url: 'www.nmc.cn/publish/temperature/index.html',
    description: `
| 类型 | 对应的值 |
| ---- | -------- |
| 最高气温 | max |
| 最低气温 | min |
| 冷空气降温 | drop |
`,
};

const urlLookup: Record<string, string> = {
    max: 'http://www.nmc.cn/publish/temperature/hight/24hour.html',
    min: 'http://www.nmc.cn/publish/temperature/low/24hour.html',
    drop: 'http://www.nmc.cn/publish/severeweather/temperaturedrop.htm',
};

const titleLookup: Record<string, string> = {
    max: '最高气温',
    min: '最低气温',
    drop: '冷空气降温',
};

async function handler(ctx: Context): Promise<Data> {
    const { type = 'max' } = ctx.req.param();
    const url = urlLookup[type];

    if (!url) {
        throw new Error(`Invalid type: ${type}`);
    }

    const title = `气温预报 - ${titleLookup[type]}`;
    const imageItem = await fetchForecastImage(url, title);
    const data: Data = {
        title: '气温预报',
        link: url,
        description: '气温预报',
        item: imageItem,
    };

    return data;
}
