import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';

import { division, link, parentOf } from './utils';

export const route: Route = {
    path: '/95598/helper',
    categories: ['forecast'],
    example: '/sgcc/95598/helper',
    radar: [{ source: ['www.95598.cn/osgweb/blackoutNotice'] }],
    name: '停电通知地区代码',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.95598.cn/osgweb/blackoutNotice',
};

async function handler(ctx: Context) {
    const { origin } = new URL(ctx.req.url);
    const provinces = await division('-1');

    const entry = (title: string, codeValue: string) => {
        const path = `/sgcc/95598/blackoutNotice/${codeValue}`;
        return {
            title,
            description: path,
            link: origin + path,
            guid: codeValue,
        };
    };

    const items = await pMap(
        provinces,
        async (province) => {
            const cities = await division(province.codeValue);
            return [entry(province.codeName, province.codeValue), ...cities.map((city) => entry(`${province.codeName} ${city.codeName}`, city.codeValue))];
        },
        { concurrency: 3 }
    );

    const provinceNames = new Map(provinces.map((province) => [province.codeValue, province.codeName]));
    const uniqueItems = new Map<string, (typeof items)[number][number]>();
    for (const item of items.flat()) {
        const parentName = provinceNames.get(parentOf(item.guid));
        if (!uniqueItems.has(item.guid) || (parentName && item.title.startsWith(`${parentName} `))) {
            uniqueItems.set(item.guid, item);
        }
    }

    return {
        title: '95598 停电通知地区代码',
        link,
        language: 'zh-CN' as const,
        item: uniqueItems.values().toArray(),
    };
}
