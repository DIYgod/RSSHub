const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const city = ctx.params.city === '全部' ? '' : ctx.params.city;
    const category = ctx.params.category === '全部' ? '' : ctx.params.category;
    const subcategory = ctx.params.subcategory === '全部' ? '' : ctx.params.subcategory;
    const keyword = ctx.params.keyword ?? '';

    const url = 'https://search.damai.cn/searchajax.html';

    const response = await got(url, {
        searchParams: {
            keyword,
            cty: city,
            ctl: category,
            sctl: subcategory,
            tsg: 0,
            st: '',
            et: '',
            order: 3,
            pageSize: 30,
            currPage: 1,
            tn: '',
        },
    });
    const data = response.data;
    const list = data.pageData.resultData || [];

    ctx.state.data = {
        title: `大麦网票务 - ${city || '全国'} - ${category || '全部分类'}${subcategory ? ' - ' + subcategory : ''}${keyword ? ' - ' + keyword : ''}`,
        link: 'https://search.damai.cn/search.htm',
        item: list.map((item) => ({
            title: item.nameNoHtml,
            author: item.actors ? cheerio.load(item.actors, null, false).text() : '大麦网',
            description: art(path.join(__dirname, 'templates/activity.art'), {
                item,
            }),
            link: `https://detail.damai.cn/item.htm?id=${item.projectid}`,
        })),
    };
};
