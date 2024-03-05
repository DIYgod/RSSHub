// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const { type = '' } = ctx.req.param();
    const referer = `https://m.douban.com/book/${type}`;

    const _ = async (type) => {
        const response = await got({
            url: `https://m.douban.com/rexxar/api/v2/subject_collection/book_${type}/items?start=0&count=10`,
            headers: { Referer: referer },
        });
        return response.data.subject_collection_items;
    };

    const items = type ? await _(type) : [...(await _('fiction')), ...(await _('nonfiction'))];

    ctx.set('data', {
        title: `豆瓣热门图书-${type ? (type === 'fiction' ? '虚构类' : '非虚构类') : '全部'}`,
        link: referer,
        description: '每周一更新',
        item: items.map(({ title, url, cover, info, rating, null_rating_reason }) => {
            const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;
            const description = `<img src="${cover.url}"><br>
              ${title}/${info}/${rate}
            `;

            return {
                title: `${title}-${info}`,
                description,
                link: url,
            };
        }),
    });
};
