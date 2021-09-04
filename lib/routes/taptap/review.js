const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const order = ctx.params.order;

    let url = `https://www.taptap.com/app/${id}/review`;

    if (order === 'update' || order === 'hot' || order === 'spent') {
        url += `?order=${order}`;
    }

    const reviews_list_response = await got.get(url);
    const $ = cheerio.load(reviews_list_response.data);

    const app_img = $('.header-icon-body > img').attr('src');
    const app_name = $('.breadcrumb > li.active').text();
    const order_name = $('.taptap-review-title.section-title li.active').text().trim();
    const reviews_list = $('.review-item-text').toArray();

    ctx.state.data = {
        title: `TapTap评价 ${app_name} - ${order_name}排序`,
        link: url,
        image: app_img,
        item: reviews_list.map((review) => {
            review = $(review);
            const score = review.find('.colored').attr('style').match(/\d+/)[0] / 14;
            const author = review.find('.item-text-header > .taptap-user ').first().text().trim();
            return {
                title: `${author} - ${score}星`,
                author: author,
                description: review.find('.item-text-body').html(),
                link: review.find('a.text-header-time').attr('href'),
                pubDate: new Date(review.find('a.text-header-time [data-dynamic-time]').text().trim()),
            };
        }),
    };
};
