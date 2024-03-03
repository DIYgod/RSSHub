// @ts-nocheck
const { gdgov } = require('../general/general');

export default async (ctx) => {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.list_con li a',
        list_include: 'site',
        title_element: '.title',
        title_match: '(.*)',
        description_element: '.artile_con',
        author_element: undefined,
        author_match: undefined,
        authorisme: '广东茂名滨海新区政务网',
        pubDate_element: '.note > span:nth-child(1)',
        pubDate_match: '时间：(.*)',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
};
