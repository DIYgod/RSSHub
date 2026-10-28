import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
            source: ['www.ceic.ac.cn/'],
            target: '/ceic/1',
        },
    ],
    name: '中国地震台',
    maintainers: ['SettingDust'],
    handler,
    url: 'www.ceic.ac.cn',
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

interface Earthquake {
    id: string;
    time: string;
    latitude: number;
    longitude: number;
    depth: number;
    magnitude: number;
    location: string;
}

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
const magnitudes = { 0: 6, 5: 3, 8: 4, 9: 5 };

async function handler(ctx) {
    let type = Number(ctx.req.param('type') ?? '1');
    if (!Number.isSafeInteger(type) || !Object.hasOwn(typeMappings, type)) {
        throw new InvalidParameterError('Invalid earthquake type. Use 1, 2, 5, 7, 8, 9, or 0.');
    }
    // Preserve the existing aliases for types omitted from the route documentation.
    if ([3, 4, 6].includes(type)) {
        type = 1;
    }
    const baseUrl = 'https://www.ceic.ac.cn';
    const earthquakes = await ofetch<Earthquake[]>(`${baseUrl}/data/data.json`);
    const now = Date.now();
    const yearAgo = new Date(now);
    yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);
    const earliest = type === 1 || type === 2 ? now - type * 24 * 60 * 60 * 1000 : yearAgo.getTime();
    const items = earthquakes
        // Match the official table's exclusion of minor Beijing events.
        .filter((earthquake) => !(earthquake.location.startsWith('北京') && earthquake.magnitude < 2))
        .map((earthquake) => {
            const pubDate = parseDate(`${earthquake.time.replace(' ', 'T')}+08:00`);
            if (!Number.isFinite(pubDate.getTime())) {
                throw new TypeError(`CEIC returned an invalid earthquake time for ${earthquake.id}. Please check the official table.`);
            }
            return { earthquake, pubDate };
        })
        .filter(({ earthquake, pubDate }) => pubDate.getTime() >= earliest && (type === 1 || type === 2 || (type === 7 ? earthquake.magnitude < 3 : earthquake.magnitude >= magnitudes[type])))
        // The previous route always exposed at most 20 events, even with a larger limit.
        .slice(0, Math.min(20, getRouteLimit(ctx, 20)))
        .map(({ earthquake, pubDate }) => ({
            title: `${earthquake.location}发生${earthquake.magnitude}级地震`,
            pubDate,
            description: `纬度(°) ${earthquake.latitude}<br>经度(°) ${earthquake.longitude}<br>深度(千米) ${earthquake.depth}`,
            guid: earthquake.id,
        }));

    return {
        title: typeMappings[type],
        link: baseUrl,
        allowEmpty: true,
        item: items,
    };
}
