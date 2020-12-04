const got = require('@/utils/got');

module.exports = async (ctx) => {
    const city = ctx.params.city === '全部' ? '' : ctx.params.city;
    const category = ctx.params.category === '全部' ? '' : ctx.params.category;
    const subcategory = ctx.params.subcategory === '全部' ? '' : ctx.params.subcategory;
    const keyword = ctx.params.keyword ? ctx.params.keyword : '';

    const url = `https://search.damai.cn/searchajax.html?keyword=${encodeURIComponent(keyword)}&cty=${encodeURIComponent(city)}&ctl=${encodeURIComponent(category)}&sctl=${encodeURIComponent(
        subcategory
    )}&tsg=0&st=&et=&order=3&pageSize=30&currPage=1&tn=`;

    const response = await got.get(url);
    const data = response.data;
    const list = data.pageData.resultData;

    ctx.state.data = {
        title: `大麦网票务 - ${city ? city : '全国'} - ${category ? category : '全部分类'}${subcategory ? ' - ' + subcategory : ''}${keyword ? ' - ' + keyword : ''}`,
        link: 'https://search.damai.cn/search.htm',
        item: list.map((item) => ({
            title: item.nameNoHtml,
            author: item.actors ? item.actors.replace(/<[^<>]*>/, '') : '大麦网',
            description: `<img src="${item.verticalPic}" /><p>${item.description}</p><p>地点：${item.venuecity} | ${item.venue}</p><p>时间：${item.showtime}</p><p>票价：${item.price_str}</p>`,
            pubDate: new Date(),
            link: `https://detail.damai.cn/item.htm?id=${item.projectid}`,
        })),
    };
};
