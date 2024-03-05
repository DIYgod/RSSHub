// @ts-nocheck
import buildData from '@/utils/common-config';
const weiboUtils = require('../utils');

export default async (ctx) => {
    const userid = ctx.req.param('userid');
    const link = `https://oasis.weibo.cn/v1/h5/share?uid=${userid}`;
    ctx.set(
        'data',
        weiboUtils.sinaimgTvax(
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
        )
    );
};
