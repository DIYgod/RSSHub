const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const info = {
        defaultPath: 'xwzx/zcjd/',
        list_element: '#main21l_main_dk > table > tbody > tr > td:nth-child(2) a',
        list_include: 'site',
        title_element: 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)',
        title_match: '(.*)',
        description_element: 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)',
        author_element: undefined,
        author_match: undefined,
        authorisme: '茂名市高新技术产业开发局政务网',
        pubDate_element: 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr > td',
        pubDate_match: '发表时间：(.*)       信息来源',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
};
