import type { Context } from 'hono';
import pMap from 'p-map';

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

interface Classroom {
    classroom_id: number;
    classroom_name: string;
    class_start?: number;
    class_end?: number;
    count: number;
}

function parseClassDate(value?: number) {
    if (value === undefined || !Number.isFinite(value)) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function fetchSkuInfo(sign: string, classroomId: number): Promise<string> {
    const skuDetail = await ofetch('https://www.xuetangx.com/api/v1/lms/product/sku_pay_detail/', {
        query: { cid: classroomId, sign },
        headers: { xtbz: 'xt' },
    });
    return skuDetail.data.sku_info.map((sku) => `${sku.name}: ¥${sku.current_price}（${sku.leaf_count} 课时）`).join('<br>');
}

async function handler(ctx: Context) {
    const { sign } = ctx.req.param();
    const baseUrl = 'https://www.xuetangx.com';
    const headers = { xtbz: 'xt' };

    const [basicInfo, classroom] = await Promise.all([
        cache.tryGet(`xuetangx:course:info:${sign}`, () => ofetch(`${baseUrl}/api/v1/lms/product/get_product_basic_info/?sign=${sign}`, { headers })),
        ofetch<{ data: { current: Classroom[] } }>(`${baseUrl}/api/v1/lms/product/classroom/`, {
            query: { sign },
            headers,
        }),
    ]);

    const link = `${baseUrl}/course/${sign}`;
    const courseTitle = basicInfo.data.course_name;
    const categories = [...new Set<string>([...(basicInfo.data.classifys ?? []), ...(basicInfo.data.tags ?? []).map((tag) => tag.title)].filter(Boolean))];
    const authors: Array<{ name: string }> = (basicInfo.data.teacher_list?.length ? basicInfo.data.teacher_list : basicInfo.data.teacher ? [basicInfo.data.teacher] : [])
        .map((teacher) => teacher.name)
        .filter(Boolean)
        .map((name) => ({ name }));

    const item = await pMap(
        classroom.data.current,
        async (c) => {
            const skuInfo = await cache.tryGet(`xuetangx:course:sku:${sign}:${c.classroom_id}`, () => fetchSkuInfo(sign, c.classroom_id));
            const classStart = parseClassDate(c.class_start);
            const classEnd = parseClassDate(c.class_end);
            const info = [`班次: ${c.classroom_name}`, ...(classStart ? [`开课时间: ${classStart.toUTCString()}`] : []), ...(classEnd ? [`结课时间: ${classEnd.toUTCString()}`] : []), skuInfo].join('<br>');
            return {
                title: `${courseTitle} - ${c.classroom_name}`,
                description: `${basicInfo.data.long_intro || basicInfo.data.short_intro || ''}<br>${info}<br>报名人数: ${c.count}`,
                link: `${link}/${c.classroom_id}`,
                guid: `${link}/${c.classroom_id}`,
                category: categories.length ? categories : undefined,
                author: authors.length ? authors : undefined,
                pubDate: classStart,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${courseTitle} - 课程信息`,
        description: basicInfo.data.short_intro,
        link,
        image: basicInfo.data.cover,
        item,
    };
}
