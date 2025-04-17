import { Context } from 'hono';
import { Route, Data, DataItem } from '@/types';
import { packImageElement } from './image';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

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
| 逐日 | daily |
| 近 30 天最高气温 | max30d |
| 近 30 天最低气温 | min30d |
| 近 30 天平均气温 | avg30d |
`,
};

const urlLookup: Record<string, string> = {
    'hourly': 'http://www.nmc.cn/publish/observations/hourly-temperature.html',
    'daily': 'http://www.nmc.cn/publish/observations/day-temperature/avg.html',
    'max30d': 'http://www.nmc.cn/publish/observations/high-30days.html',
    'min30d': 'http://www.nmc.cn/publish/observations/low-30days.html',
    'avg30d': 'http://www.nmc.cn/publish/observations/mta-30days.html',
};

const titleLookup: Record<string, string> = {
    'hourly': '逐时气温',
    'daily': '逐日气温',
    'max30d': '近 30 天最高气温',
    'min30d': '近 30 天最低气温',
    'avg30d': '近 30 天平均气温',
};

async function fetchImages(url: string, title: string): Promise<DataItem[]> {
    const page = await ofetch(url);
    const $ = load(page);
    const timeColumnItems = $('.col-xs-12.time').toArray();

    const entries = await Promise.all(
        timeColumnItems.map((it) => {
            const element = $(it);
            const imageUrl = element.attr('data-img') || '';
            const refernceTime = element.text().trim();

            return packImageElement(imageUrl, refernceTime);
        })
    );

    return entries.map((entry) => {
        const date = entry.date;
        const content = entry.content;
        return {
            title: `${title} - ${date.toISOString()}`,
            description: content,
            link: url,
            pubDate: date,
        };
    });
}

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
