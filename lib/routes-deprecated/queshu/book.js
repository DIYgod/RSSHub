const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const bookid = ctx.params.bookid;
    const link = `http://www.queshu.com/book/${bookid}`;
    const host = `http://www.queshu.com`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        allowEmpty: true,
        params: {
            title: `$('#book_left > #h1').text().trim() + ' - 单品活动信息 - 缺书网'`,
            host,
        },
        item: {
            item: '.stacked.right_state > a',
            title: `$('.right_item .bodycol_258').text()`,
            link: `'%host%' + $('.right_item').parent().attr('href')`,
        },
    });
};
