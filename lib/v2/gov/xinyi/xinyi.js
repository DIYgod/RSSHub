const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.newsList li a',
        list_include: 'site',
        title_element: '.title',
        title_match: '(.*)',
        description_element: '.conTxt',
        author_element: undefined,
        author_match: undefined,
        authorisme: '信宜市人民政府网',
        pubDate_element: '.property span:nth-child(-n+2)',
        pubDate_match: '发布时间：(.*)',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
};
