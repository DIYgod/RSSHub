import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getChannel, processItems, rootUrl } from './utils';

export const route: Route = {
    path: '/news/:id?',
    categories: ['traditional-media'],
    example: '/yicai/news',
    parameters: { id: '分类 id，见下表，可在对应分类页中找到，默认为新闻' },
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
            source: ['yicai.com/news/:id', 'yicai.com/news'],
            target: '/news/:id?',
        },
    ],
    name: '新闻',
    maintainers: ['nczitzk'],
    handler,
    description: `| Id                       | 名称       |
| ------------------------ | ---------- |
| gushi                    | A 股       |
| kechuangban              | 科创板     |
| hongguan                 | 大政       |
| jinrong                  | 金融       |
| quanqiushichang          | 海外市场   |
| gongsi                   | 产经       |
| shijie                   | 全球       |
| kechuang                 | 科技       |
| quyu                     | 区域       |
| comment                  | 评论       |
| dafengwenhua             | 商业人文   |
| books                    | 阅读周刊   |
| loushi                   | 地产       |
| automobile               | 汽车       |
| china\\_financial\\_herald | 对话陆家嘴 |
| fashion                  | 时尚       |
| ad                       | 商业资讯   |
| info                     | 资讯       |
| jzfxb                    | 价值风向标 |
| shuducaijing             | 数读财经   |
| shujujiepan              | 数据解盘   |
| shudushenghuo            | 数读生活   |
| cbndata                  | CBNData    |
| dtcj                     | DT 财经    |
| xfsz                     | 消费数知   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const limit = getRouteLimit(ctx, 30);
    const channel = id ? await getChannel('news', id, limit) : undefined;

    const currentUrl = `${rootUrl}/news${id ? `/${channel!.slug}` : ''}`;
    const apiUrl = `${rootUrl}/api/ajax/${id ? `getlistbycid?cid=${channel!.id}` : 'getjuhelist?action=news'}&page=1&pagesize=${limit}`;

    const items = await processItems(apiUrl, channel?.items);

    return {
        title: `第一财经 - ${channel?.name ?? '新闻'}`,
        link: currentUrl,
        item: items,
    };
}
