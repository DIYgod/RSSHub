const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const info = {
        defaultPath: 'syzl/zcjd/',
        list_element: '.list-content li a',
        list_include: 'site',
        title_element: 'h3',
        title_match: '(.*)',
        description_element: '.txt',
        author_element: undefined,
        author_match: undefined,
        authorisme: '化州市人民政府网',
        pubDate_element: '.article-date',
        pubDate_match: '日期：(.*)',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
};
