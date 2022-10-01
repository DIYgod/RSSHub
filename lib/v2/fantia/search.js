const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const Config = require('@/config').value.fantia;

module.exports = async (ctx) => {
    const type = ctx.params.type || 'posts';
    const caty = ctx.params.caty || '';
    const order = ctx.params.order || 'updater';
    const rating = ctx.params.rating || 'all';
    const keyword = ctx.params.keyword || '';
    const period = ctx.params.period || '';

    const rootUrl = 'https://fantia.jp';
    const apiUrl = `${rootUrl}/api/v1/search/${type}?keyword=${keyword}&peroid=${period}&brand_type=0&category=${caty === 'all' ? '' : caty}&order=${order}${
        rating === 'all' ? '' : rating === 'general' ? '&rating=general' : '&adult=1'
    }&per_page=30`;
    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Cookie: Config.cookies ? Config.cookies : '',
        },
    });

    let items = {};

    switch (type) {
        case 'fanclubs': {
            items = response.data.fanclubs.map((item) => ({
                title: item.fanclub_name_with_creator_name,
                link: `${rootUrl}/fanclubs/${item.id}`,
                description: `${item.icon ? `<img src="${item.icon.main}">` : ''}"><p>${item.title}</p>`,
            }));
            break;
        }
        case 'posts': {
            items = response.data.posts.map((item) => ({
                title: item.title,
                link: `${rootUrl}/posts/${item.id}`,
                pubDate: parseDate(item.posted_at),
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.comment ? `<p>${item.comment}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;
        }
        case 'products': {
            items = response.data.products.map((item) => ({
                title: item.name,
                link: `${rootUrl}/products/${item.id}`,
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.buyable_lowest_plan.description ? `<p>${item.buyable_lowest_plan.description}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;
        }
        case 'commissions': {
            items = response.data.commissions.map((item) => ({
                title: item.name,
                link: `${rootUrl}/commissions/${item.id}`,
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.buyable_lowest_plan.description ? `<p>${item.buyable_lowest_plan.description}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;
        }
    }

    ctx.state.data = {
        title: `Fantia - Search ${type}`,
        link: apiUrl.replace('api/v1/search/', ''),
        item: items,
    };
};
