const { getNoticeList } = require('./utils');

const url = 'https://lib.njxzc.edu.cn/pxyhd/list.htm';
const host = 'https://lib.njxzc.edu.cn';

module.exports = async (ctx) => {
    const out = await getNoticeList(
        ctx,
        url,
        host,
        'a',
        '.news_meta',
        {
            title: '.arti_title',
            content: '.wp_articlecontent',
            date: '.arti_update',
        },
        '.news'
    );

    ctx.state.data = {
        title: '南京晓庄学院 -- 图书馆通知公告',
        link: url,
        item: out,
    };
};
