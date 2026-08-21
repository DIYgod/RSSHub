const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `http://www.queshu.com/sale/`;
    const host = `http://www.queshu.com`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: '图书促销 - 缺书网',
            host,
        },
        item: {
            item: '#tb_sale tr',
            title: `$('.news_sale_detail .sale_btn').text() + '：' + $('.news_sale_title a').text()`,
            link: `'%host%' + $('.news_sale_title a').attr('href')`,
            description: `$('.news_sale_detail .sale_btn').text() + '：' + $('.news_sale_title a').text()
                        + '<br>'
                        + $('.news_sale_detail .sale_time_end').first().text()
                        + '<br>'
                        + '发布时间：' + $('.news_sale_detail .sale_time_end.inline_right').text()

            `,
            pubDate: `date($('.news_sale_detail .sale_time_end.inline_right').text())`,
        },
    });
};
