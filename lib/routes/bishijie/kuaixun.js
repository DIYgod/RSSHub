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
            item: 'ul.newscontainer > li',
            title: `$('div.content a h3').text()`,
            link: `$('div.content a').attr('href')`,
            description: `$('div.content div.news-content div').html()`,
        },
    });
};
