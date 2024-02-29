const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.news_list li a',
        title_element: '.content_title',
        title_match: '(.*)',
        description_element: '#zoomcon',
        author_element: undefined,
        author_match: undefined,
        authorisme: '茂名市电白区人民政府网',
        pubDate_element: 'publishtime',
        pubDate_match: '(.*)',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
};
