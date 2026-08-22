import type { Context } from 'hono';

import type { Language, Route } from '@/types';

import { division, link } from './utils';

export const route: Route = {
    path: '/95598/helper',
    categories: ['forecast'],
    example: '/sgcc/95598/helper',
    name: '停电通知地区代码',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.95598.cn/osgweb/blackoutNotice',
};

async function handler(ctx: Context) {
    const { origin } = new URL(ctx.req.url);
    const provinces = await division('-1');

    const entry = (title: string, codeValue: string) => {
        const path = `/sgcc/95598/${codeValue}`;
        return {
            title,
            description: path,
            link: origin + path,
            guid: codeValue,
        };
    };

    const items = await Promise.all(
        provinces.map(async (province) => {
            const cities = await division(province.codeValue);
            return [entry(province.codeName, province.codeValue), ...cities.map((city) => entry(`${province.codeName} ${city.codeName}`, city.codeValue))];
        })
    );

    return {
        title: '95598 停电通知地区代码',
        link,
        language: 'zh-CN' as Language,
        item: items.flat(),
    };
}
