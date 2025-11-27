import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ceic/:type?',
    categories: ['forecast'],
    example: '/earthquake/ceic/1',
    parameters: { type: '类型，见下表' },
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
            source: ['www.cea.gov.cn/cea/xwzx/zqsd/index.html', 'www.cea.gov.cn/'],
            target: '',
        },
    ],
    name: '中国地震台',
    maintainers: ['SettingDust'],
    handler,
    url: 'www.cea.gov.cn/cea/xwzx/zqsd/index.html',
    description: `| 参数 | 类型                        |
| ---- | --------------------------- |
| 1    | 最近 24 小时地震信息        |
| 2    | 最近 48 小时地震信息        |
| 5    | 最近一年 3.0 级以上地震信息 |
| 7    | 最近一年 3.0 级以下地震     |
| 8    | 最近一年 4.0 级以上地震信息 |
| 9    | 最近一年 5.0 级以上地震信息 |
| 0    | 最近一年 6.0 级以上地震信息 |

  可通过全局过滤参数订阅您感兴趣的地区.`,
};

async function handler(ctx) {
    let type = Number(ctx.req.param('type'));
    type = type ?? 1;
    const baseUrl = 'http://www.ceic.ac.cn';
    const api = `${baseUrl}/ajax/speedsearch?num=${type}`;
    const mappings = {
        O_TIME: '发震时刻(UTC+8)',
        LOCATION_C: '参考位置',
        M: '震级(M)',
        EPI_LAT: '纬度(°)',
        EPI_LON: '经度(°)',
        EPI_DEPTH: '深度(千米)',
        SAVE_TIME: '录入时间',
    };

    const typeMappings = {
        1: '最近24小时地震信息',
        2: '最近48小时地震信息',
        3: '最近7天地震信息',
        4: '最近30天地震信息',
        5: '最近一年3.0级以上地震信息',
        6: '最近一年地震信息',
        7: '最近一年3.0级以下地震',
        8: '最近一年4.0级以上地震信息',
        9: '最近一年5.0级以上地震信息',
        0: '最近一年6.0级以上地震信息',
    };

    // 因为item数量限制20，所以对于RSS来说为无用类型，防止浪费资源
    const disabledType = [3, 4, 6];

    if (disabledType.includes(type)) {
        type = 1;
    }
    const typeName = typeMappings[type];

    const response = await got(api);
    const data = response.data.replace(/,"page":"(.*?)","num":/, ',"num":');
    let json = JSON.parse(data.substring(1, data.length - 1)).shuju;
    if (json.length > 20) {
        json = json.slice(0, 20);
    }

    return {
        title: typeName,
        link: `${baseUrl}/speedsearch`,
        allowEmpty: true,
        item: json.map((entity) => {
            const contentBuilder = [];
            const { NEW_DID, LOCATION_C, M, O_TIME } = entity;
            for (const mappingsKey in mappings) {
                contentBuilder.push(`${mappings[mappingsKey]} ${entity[mappingsKey]}`);
            }

            return {
                title: `${LOCATION_C}发生${M}级地震`,
                link: `${baseUrl}/${NEW_DID}.html`,
                pubDate: timezone(parseDate(O_TIME, 'YYYY-MM-DD HH:mm:ss'), +8),
                description: contentBuilder.join('<br>'),
                guid: NEW_DID,
            };
        }),
    };
}
