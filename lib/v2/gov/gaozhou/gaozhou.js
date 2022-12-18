const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const info = {
        defaultPath: 'zcjd/',
        list_element: '.newslist li a',
        list_include: 'site',
        title_element: '.head',
        title_match: '(.*)',
        description_element: '.contener',
        author_element: undefined,
        author_match: undefined,
        authorisme: '高州市人民政府网',
        pubDate_element: '.time span:nth-child(1)',
        pubDate_match: '发布时间：(.*)',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
};
