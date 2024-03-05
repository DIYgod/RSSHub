// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/booklet_api/v1/booklet/listbycategory',
        json: { category_id: '0', cursor: '0', limit: 20 },
    });

    const { data } = response.data;
    const items = data.map(({ base_info }) => ({
        title: base_info.title,
        link: `https://juejin.cn/book/${base_info.booklet_id}`,
        description: `
            <img src="${base_info.cover_img}"><br>
            <strong>${base_info.title}</strong><br><br>
            ${base_info.summary}<br>
            <strong>价格:</strong> ${base_info.price / 100}元
        `,
        pubDate: parseDate(base_info.ctime * 1000),
        guid: base_info.booklet_id,
    }));

    ctx.set('data', {
        title: '掘金小册',
        link: 'https://juejin.cn/books',
        item: items,
    });
};
