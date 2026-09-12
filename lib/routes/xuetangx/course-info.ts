import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/course/:sign',
    categories: ['study'],
    example: '/xuetangx/course/THU08091000320',
    parameters: { sign: '课程 sign（如 `THU08091000320`），从课程页 URL 中可得到' },
    radar: [
        {
            source: ['www.xuetangx.com/course/:sign'],
        },
    ],
    name: '课程信息',
    maintainers: ['sanmmm'],
    handler,
};

async function handler(ctx: Context) {
    const { sign } = ctx.req.param();
    const baseUrl = 'https://www.xuetangx.com';
    const headers = { xtbz: 'xt' };

    const [basicInfo, classroom] = await Promise.all([
        cache.tryGet(`xuetangx:course:info:${sign}`, () => ofetch(`${baseUrl}/api/v1/lms/product/get_product_basic_info/?sign=${sign}`, { headers })),
        ofetch(`${baseUrl}/api/v1/lms/product/classroom/`, {
            query: { sign },
            headers,
        }),
    ]);

    const link = `${baseUrl}/course/${sign}`;
    const courseTitle = basicInfo.data.course_name;

    const item = await Promise.all(
        classroom.data.current.map(async (c) => {
            const skuDetail = await ofetch(`${baseUrl}/api/v1/lms/product/sku_pay_detail/`, {
                query: {
                    cid: c.classroom_id,
                    sign,
                },
                headers,
            });
            const skuInfo = skuDetail.data.sku_info.map((sku) => `${sku.name}: ¥${sku.current_price}（${sku.leaf_count} 课时）`).join('<br>');
            const info = `班次: ${c.classroom_name}<br>开课时间: ${parseDate(c.class_start).toUTCString()}<br>结课时间: ${parseDate(c.class_end).toUTCString()}<br>${skuInfo}`;
            return {
                title: `${courseTitle} - ${c.classroom_name}`,
                description: `${info}<br>报名人数: ${c.count}`,
                link: `${link}/${c.classroom_id}`,
                guid: info,
                pubDate: parseDate(c.class_start),
            };
        })
    );

    return {
        title: `${courseTitle} - 课程信息`,
        description: basicInfo.data.short_intro,
        link,
        image: basicInfo.data.cover,
        item,
        allowEmpty: true,
    };
}
