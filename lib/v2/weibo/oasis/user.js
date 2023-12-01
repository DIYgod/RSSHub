const buildData = require('@/utils/common-config');
const weiboUtils = require('../utils');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const link = `https://oasis.weibo.cn/v1/h5/share?uid=${userid}`;
    ctx.state.data = weiboUtils.sinaimgTvax(
        await buildData({
            link,
            url: link,
            title: `$('.name-main').text().trim() + ' - 用户 - 绿洲'`,
            description: `$('.desc').text().trim()`,
            item: {
                item: '.container .status-item',
                title: `$('.status-item-title').clone().children().remove().end().text()`,
                description: `$('.status-item-title').clone().children().remove().end().text() + '<br>' + $('.status-img').html()`,
                link: `'https://oasis.weibo.cn/v1/h5/share?sid=' + $('.status-item-title').parent().data('id')`,
            },
        })
    );
};
