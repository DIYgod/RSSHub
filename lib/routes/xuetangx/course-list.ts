import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/course/list/:classify?/:status?/:sellingType?',
    categories: ['study'],
    example: '/xuetangx/course/list/1/2',
    parameters: {
        classify: {
            description: '学科分类，默认为全部',
            options: [
                { value: '1', label: '计算机' },
                { value: '2', label: '经济学' },
                { value: '4', label: '农林园艺' },
                { value: '8', label: '医药卫生' },
                { value: '11', label: '理学' },
                { value: '13', label: '历史' },
                { value: '14', label: '法学' },
                { value: '15', label: '文学文化' },
                { value: '16', label: '哲学' },
                { value: '17', label: '艺术设计' },
                { value: '19', label: '外语' },
                { value: '21', label: '教育教学' },
                { value: '23', label: '管理学' },
                { value: '24', label: '工学' },
                { value: '27', label: '其他' },
            ],
        },
        status: {
            description: '课程状态，默认为全部',
            options: [
                { value: '1', label: '即将开课' },
                { value: '2', label: '开课中' },
                { value: '3', label: '已结课' },
            ],
        },
        sellingType: {
            description: '课程类型，默认为全部',
            options: [
                { value: '2', label: '训练营' },
                { value: '3', label: '微学位' },
                { value: '4', label: '高校认证' },
                { value: '5', label: '直播课' },
            ],
        },
    },
    radar: [
        {
            source: ['www.xuetangx.com/search'],
            target: '/course/list',
        },
    ],
    name: '课程列表',
    maintainers: ['sanmmm'],
    handler,
};

async function handler(ctx: Context) {
    const { classify, status, sellingType } = ctx.req.param();
    const baseUrl = 'https://www.xuetangx.com';

    const response = await ofetch(`${baseUrl}/api/v1/lms/get_product_list/`, {
        method: 'POST',
        query: { page: 1 },
        headers: { xtbz: 'xt' },
        body: {
            query: '',
            chief_org: [],
            classify: classify ? [Number(classify)] : [],
            selling_type: sellingType ? [Number(sellingType)] : [],
            status: status ? [Number(status)] : [],
            appid: 10000,
        },
    });

    const item = response.data.product_list.map((product) => ({
        title: product.name,
        link: `${baseUrl}/course/${product.sign}`,
        description: `${product.short_intro}<br>
        ${product.org.name} / ${product.teacher.map((teacher) => teacher.name).join('、')}<br>
        ${product.sell_type_name} / ${product.classify_name.join('、')} / 报名人数: ${product.count}<br>
        <img src="${product.cover}">`,
        pubDate: parseDate(product._ut || product.created),
    }));

    return {
        title: '学堂在线 - 课程列表',
        link: `${baseUrl}/search?query=`,
        item,
    };
}
