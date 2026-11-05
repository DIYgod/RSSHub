import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:id',
    categories: ['design'],
    example: '/ui.cn/user/85974',
    parameters: { id: '用户 id' },
    name: '个人作品',
    maintainers: ['WenryXu'],
    handler,
};
async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const link = `https://i.ui.cn/ucenter/${id}.html`;
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('.person_name').text();
    const intro = $('.person_intro').text();
    const data = await ofetch(`https://i.ui.cn/index.php/Uweb/Api/projectlst?uid=${id}&type=&size=12&page=0`, {
        headers: {
            Referer: link,
        },
    });
    return {
        title: `${name} 的设计作品 - UI 中国`,
        link,
        description: intro,
        item: data.data.list.map((item) => {
            const pubDate = isOneOf(item.createtime, [undefined, null]) || item.createtime === '' ? undefined : parseDate(item.createtime, 'X');
            return {
                title: item.name,
                description: `<img src="${item.picurl}">`,
                link: `https://www.ui.cn/detail/${item.id}.html`,
                guid: String(item.id),
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                category: item.tags?.split(','),
                image: item.picurl,
            };
        }),
    };
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
