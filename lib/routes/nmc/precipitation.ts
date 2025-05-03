import { Context } from 'hono';
import { Route, Data } from '@/types';
import { fetchImages } from './image';

export const route: Route = {
    path: '/observation/precipitation/:frequency?',
    categories: ['forecast'],
    example: '/nmc/observation/precipitation/hourly',
    parameters: { frequency: '数据频率，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '降水量',
    maintainers: ['dousha'],
    handler,
    url: 'nmc.cn/publish/observations/index.html',
    description: `
| 频率 | 对应的值 |
| ---- | -------- |
| 逐时 | hourly |
| 每 6 小时 | 6hour |
| 逐日 | daily |
| 近 30 天降水量 | 30d |
| 近 30 天降水量距离平均值 | 30pa |
`,
};

const urlLookup: Record<string, string> = {
    hourly: 'http://www.nmc.cn/publish/observations/hourly-precipitation.html',
    '6h': 'http://www.nmc.cn/publish/observations/6hour-precipitation.html',
    daily: 'http://www.nmc.cn/publish/observations/24hour-precipitation.html',
    '30d': 'http://www.nmc.cn/publish/observations/precipitation-30day.html',
    '30pa': 'http://www.nmc.cn/publish/observations/precipitation-30pa.html',
};

const titleLookup: Record<string, string> = {
    hourly: '逐时降水量',
    '6h': '每 6 小时降水量',
    daily: '逐日降水量',
    '30d': '近 30 天降水量',
    '30pa': '近 30 天降水量距离平均值',
};

async function handler(ctx: Context): Promise<Data> {
    const { frequency = 'hourly' } = ctx.req.param();
    const url = urlLookup[frequency];
    if (!url) {
        throw new Error(`Invalid frequency: ${frequency}`);
    }

    const title = `降水量 - ${titleLookup[frequency]}`;
    const imageItem = await fetchImages(url, title);
    const data: Data = {
        title: '降水量',
        link: url,
        description: '降水量',
        item: imageItem,
    };

    return data;
}
