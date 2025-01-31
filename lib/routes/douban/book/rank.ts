import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/book/rank/:type?',
    categories: ['social-media'],
    example: '/douban/book/rank/fiction',
    parameters: { type: '图书类型，默认合并列表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '热门图书排行',
    maintainers: ['xyqfer', 'queensferryme'],
    handler,
    description: `| 全部 | 虚构    | 非虚构     |
| ---- | ------- | ---------- |
|      | fiction | nonfiction |`,
};

async function handler(ctx) {
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

    return {
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
    };
}
