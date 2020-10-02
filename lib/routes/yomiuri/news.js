const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.yomiuri.co.jp/${category}`;

    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    let category_name = '';
    let list = null;
    if (category === 'news') {
        category_name = '総合';
        list = $('ul.news-top-upper-content-topics-content-list.p-list').children('li').not('.p-member-only');
    } else {
        category_name = $('h1.p-header-category-current-title').text();
        list = $('div.p-category-organization,.p-category-time-series').find('li').not('.p-member-only').not('.p-ad-list-item');
    }

    const items = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const link = item.find('a').attr('href');
                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('div.p-main-contents').html();
                });
                return {
                    title: item.find('a').text(),
                    description,
                    link,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: '読売新聞-' + category_name,
        link: url,
        item: items,
    };
};
