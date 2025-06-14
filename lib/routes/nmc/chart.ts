import { Context } from 'hono';
import { Route, Data } from '@/types';
import { fetchImages } from './image';

export const route: Route = {
    path: '/observation/chart/:region?/:level?/:type?',
    categories: ['forecast'],
    example: '/nmc/observation/chart/cn/0/basic',
    parameters: { region: '区域，见下表', level: '层次，见下表', type: '图表类型，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '天气图',
    maintainers: ['dousha'],
    handler,
    url: 'nmc.cn/publish/observations/index.html',
    description: `
| 区域 | 对应的值 |
| ---- | -------- |
| 全国 | cn |
| 亚欧 | ae |
| 北半球 | nh |

| 层次 | 对应的值 |
| ---- | -------- |
| 地面 | 0 |
| 925hPa | 925 |
| 850hPa | 850 |
| 700hPa | 700 |
| 500hPa | 500 |
| 200hPa | 200 |
| 100hPa | 100 |

| 图表类型 | 对应的值 | 备注 |
| -------- | -------- | ---- |
| 基本天气图 | basic | |
| 叠加雷达图 | radar | 区域为北半球时不可用 |
`,
};

function getUrl(region: string, level: string, type: string): string {
    const baseUrl = 'http://www.nmc.cn/publish/observations';
    const regionMap: Record<string, string> = {
        cn: 'china',
        ae: 'asia',
        nh: 'north',
    };

    const levelMap: Record<string, string> = {
        '0': 'h000',
        '925': 'h925',
        '850': 'h850',
        '700': 'h700',
        '500': 'h500',
        '200': 'h200',
        '100': 'h100',
    };

    const typeMap: Record<string, string> = {
        basic: 'weatherchart',
        radar: 'radar',
    };

    const regionPath = regionMap[region] || 'china';
    const levelPath = levelMap[level] || 'h000';
    const typePath = typeMap[type] || 'weatherchart';

    return `${baseUrl}/${regionPath}/dm/${typePath}-${levelPath}.html`;
}

async function handler(ctx: Context): Promise<Data> {
    const { region = 'cn', level = '0', type = 'basic' } = ctx.req.param();
    const url = getUrl(region, level, type);

    const title = `天气图`;
    const imageItem = await fetchImages(url, title);
    const data: Data = {
        title: '降水量',
        link: url,
        description: '降水量',
        item: imageItem,
    };

    return data;
}
