import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/category/:id',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/jin10/category/36',
    parameters: { id: '分类id，见下表' },
    description: `
| Name           | ID   |
|----------------|------|
| 贵金属         | 1    |
| 黄金           | 2    |
| 白银           | 3    |
| 钯金           | 4    |
| 铂金           | 5    |
| 石油           | 6    |
| WTI原油        | 7    |
| 布伦特原油     | 8    |
| 欧佩克         | 9    |
| 页岩气         | 10   |
| 原油市场报告   | 11   |
| 外汇           | 12   |
| 欧元           | 13   |
| 英镑           | 14   |
| 日元           | 15   |
| 美元           | 16   |
| 瑞郎           | 17   |
| 人民币         | 18   |
| 期货           | 36   |
| 油脂油料       | 145  |
| 钢矿           | 146  |
| 煤炭           | 147  |
| 化工           | 148  |
| 有色           | 149  |
| 谷物           | 150  |
| 糖棉果蛋       | 151  |
| 生猪           | 152  |
| 碳排放         | 154  |
| 数字货币       | 19   |
| 数字人民币     | 107  |
| 科技           | 22   |
| 手机           | 23   |
| 电动汽车       | 39   |
| 芯片           | 40   |
| 中国突破       | 41   |
| 5G             | 42   |
| 量子计算       | 43   |
| 航空航天       | 158  |
| 元宇宙         | 165  |
| 人工智能       | 168  |
| 地缘局势       | 24   |
| 缅甸局势       | 44   |
| 印巴纷争       | 45   |
| 中东风云       | 46   |
| 阿富汗局势     | 155  |
| 俄乌冲突       | 167  |
| 人物           | 25   |
| 鲍威尔         | 47   |
| 马斯克         | 48   |
| 拉加德         | 49   |
| 特朗普         | 50   |
| 拜登           | 51   |
| 巴菲特         | 157  |
| 央行           | 26   |
| 美联储         | 53   |
| 中国央行       | 54   |
| 欧洲央行       | 55   |
| 日本央行       | 56   |
| 货币政策调整   | 137  |
| 英国央行       | 141  |
| 澳洲联储       | 159  |
| 新西兰联储     | 160  |
| 加拿大央行     | 161  |
| 美股           | 27   |
| 财报           | 59   |
| Reddit散户动态 | 60   |
| 个股动态       | 108  |
| 港股           | 28   |
| 美股回港       | 61   |
| 交易所动态     | 62   |
| 指数动态       | 63   |
| 个股动态       | 109  |
| A股            | 29   |
| 美股回A        | 64   |
| 券商分析       | 65   |
| 板块异动       | 66   |
| 大盘动态       | 67   |
| 南北资金       | 68   |
| 亚盘动态       | 69   |
| IPO信息        | 70   |
| 个股动态       | 110  |
| 北交所         | 166  |
| 基金           | 30   |
| 投行机构       | 31   |
| 标普、惠誉、穆迪 | 71  |
| 美银           | 72   |
| 高盛           | 112  |
| 疫情           | 32   |
| 疫苗动态       | 73   |
| 确诊数据       | 74   |
| 新冠药物       | 113  |
| 债券           | 33   |
| 政策           | 34   |
| 中国           | 75   |
| 美国           | 76   |
| 欧盟           | 77   |
| 日本           | 78   |
| 贸易、关税     | 79   |
| 碳中和         | 80   |
| 中国香港       | 81   |
| 英国           | 120  |
| 房地产动态     | 156  |
| 经济数据       | 35   |
| 中国           | 82   |
| 美国           | 83   |
| 欧盟           | 84   |
| 日本           | 85   |
| 公司           | 37   |
| 特斯拉         | 86   |
| 苹果           | 90   |
| 独角兽         | 91   |
| 谷歌           | 92   |
| 华为           | 93   |
| 阿里巴巴       | 94   |
| 小米           | 95   |
| 字节跳动       | 116  |
| 腾讯           | 117  |
| 微软           | 118  |
| 百度           | 119  |
| 美团           | 162  |
| 滴滴           | 163  |
| 中国恒大       | 164  |
| 灾害事故       | 38   |
| 地震           | 96   |
| 爆炸           | 97   |
| 海啸           | 98   |
| 寒潮           | 99   |
| 洪涝           | 100  |
| 火灾           | 101  |
| 矿难           | 102  |
| 枪击案         | 103  |
`,
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
            source: ['jin10.com/'],
            target: '',
        },
    ],
    name: '外汇',
    maintainers: ['laampui'],
    handler,
    url: 'jin10.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const data = await cache.tryGet(
        'jin10:aa:${category}',
        async () => {
            const { data: response } = await got('https://4a735ea38f8146198dc205d2e2d1bd28.z3c.jin10.com/flash', {
                headers: {
                    'x-app-id': 'bVBF4FyRTn5NJF5n',
                    'x-version': '1.0',
                },
                searchParams: {
                    channel: '-8200',
                    vip: '1',
                    classify: `[${id}]`,
                },
            });
            return response.data.filter((item) => item.type !== 1);
        },
        config.cache.routeExpire,
        false
    );

    const item = data.map((item) => {
        const titleMatch = item.data.content.match(/^【(.*?)】/);
        let title;
        let content = item.data.content;
        if (titleMatch) {
            title = titleMatch[1];
            content = content.replace(titleMatch[0], '');
        } else {
            title = item.data.vip_title || item.data.content;
        }

        return {
            title,
            description: renderDescription(content, item.data.pic),
            pubDate: timezone(parseDate(item.time), 8),
            guid: `jin10:category:${item.id}`,
        };
    });

    return {
        title: '金十数据',
        link: 'https://www.jin10.com/',
        item,
    };
}
