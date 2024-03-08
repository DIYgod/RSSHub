import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/search/:type?/:caty?/:period?/:order?/:rating?/:keyword?',
    categories: ['anime'],
    example: '/fantia/search/posts/all/daily',
    parameters: {
        type: 'Type, see the table below, `posts` by default',
        caty: 'Category, see the table below, can also be found in search page URL, `すべてのクリエイター` by default',
        period: 'Ranking period, see the table below, empty by default',
        order: 'Sorting, see the table below, `更新の新しい順` by default',
        rating: 'Rating, see the table below, `すべて` by default',
        keyword: 'Keyword, empty by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'posts';
    const caty = ctx.req.param('caty') || '';
    const order = ctx.req.param('order') || 'updater';
    const rating = ctx.req.param('rating') || 'all';
    const keyword = ctx.req.param('keyword') || '';
    const period = ctx.req.param('period') || '';

    const rootUrl = 'https://fantia.jp';
    const apiUrl = `${rootUrl}/api/v1/search/${type}?keyword=${keyword}&peroid=${period}&brand_type=0&category=${caty === 'all' ? '' : caty}&order=${order}${
        rating === 'all' ? '' : rating === 'general' ? '&rating=general' : '&adult=1'
    }&per_page=30`;
    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Cookie: config.fantia.cookies ?? '',
        },
    });

    let items = {};

    switch (type) {
        case 'fanclubs':
            items = response.data.fanclubs.map((item) => ({
                title: item.fanclub_name_with_creator_name,
                link: `${rootUrl}/fanclubs/${item.id}`,
                description: `${item.icon ? `<img src="${item.icon.main}">` : ''}"><p>${item.title}</p>`,
            }));
            break;

        case 'posts':
            items = response.data.posts.map((item) => ({
                title: item.title,
                link: `${rootUrl}/posts/${item.id}`,
                pubDate: parseDate(item.posted_at),
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.comment ? `<p>${item.comment}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;

        case 'products':
            items = response.data.products.map((item) => ({
                title: item.name,
                link: `${rootUrl}/products/${item.id}`,
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.buyable_lowest_plan.description ? `<p>${item.buyable_lowest_plan.description}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;

        case 'commissions':
            items = response.data.commissions.map((item) => ({
                title: item.name,
                link: `${rootUrl}/commissions/${item.id}`,
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.buyable_lowest_plan.description ? `<p>${item.buyable_lowest_plan.description}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;
    }

    return {
        title: `Fantia - Search ${type}`,
        link: apiUrl.replace('api/v1/search/', ''),
        item: items,
    };
}
