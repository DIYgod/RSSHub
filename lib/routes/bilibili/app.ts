import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const config = {
    android: '安卓版',
    iphone: 'iPhone 版',
    ipad: 'iPad HD 版',
    win: 'UWP 版',
    android_tv_yst: 'TV 版',
};

interface AppVersion {
    plat: number;
    desc: string;
    version: string;
    build: number;
    ptime: number;
}

export const route: Route = {
    path: '/app/:id?',
    categories: ['program-update'],
    example: '/bilibili/app/android',
    parameters: { id: '客户端 id，见下表，默认为安卓版' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '更新情报',
    maintainers: ['nczitzk'],
    handler,
    description: `| 安卓版  | iPhone 版 | iPad HD 版 | UWP 版 | TV 版            |
| ------- | --------- | ---------- | ------ | ---------------- |
| android | iphone    | ipad       | win    | android\\_tv\\_yst |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') || 'android';
    if (!Object.hasOwn(config, id)) {
        throw new InvalidParameterError(`Client id must be one of ${Object.keys(config).join(', ')}`);
    }

    const rootUrl = 'https://app.bilibili.com';
    const apiUrl = `${rootUrl}/x/v2/version?mobi_app=${id}`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const versions = new Map<string, AppVersion>(response.data.data.map((item: AppVersion) => [`${item.plat}-${item.build}-${item.ptime}`, item]));
    const items = versions
        .values()
        .toArray()
        .map((item) => ({
            link: rootUrl,
            guid: `bilibili-app-${id}-${item.plat}-${item.build}-${item.ptime}`,
            title: item.version,
            pubDate: parseDate(item.ptime, 'X'),
            description: `<li>${item.desc.split('\n-').join('</li><li>-')}</li>`,
        }));

    return {
        title: `哔哩哔哩更新情报 - ${config[id]}`,
        link: rootUrl,
        item: items,
    };
}
