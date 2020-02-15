const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `https://www.bishijie.com/kuaixun/`;
    const host = `https://www.bishijie.com`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: '币世界快讯列表',
            host,
        },
        item: {
            item: '.livetop ul',
            title: `$('li.lh32 h2 a').text()`,
            link: `'%host%' + $('li.lh32 h2 a').attr('href')`,
            description: `$('li.lh32 div a').html()`,
            pubDate: `new Date($('li.lh32').parent().attr('id')*1000).toUTCString()`,
            guid: `$('li.lh32').parent().data('id')`,
        },
    });
};
