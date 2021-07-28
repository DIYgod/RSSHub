const { resolve } = require('url');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const LZString = require('lz-string');

const getChapters = ($) =>
    $('.chapter-list > ul')
        .toArray()
        .reverse()
        .reduce((acc, curr) => acc.concat($(curr).children('li').toArray()), [])
        .map((ele) => {
            const a = $(ele).children('a');
            return {
                link: resolve('https://www.manhuagui.com/', a.attr('href')),
                title: a.attr('title'),
                num: a.find('i').text(),
            };
        });

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { data } = await got.get(`https://www.manhuagui.com/comic/${id}/`);
    const $ = cheerio.load(data);

    if ($('#__VIEWSTATE').length > 0) {
        const n = LZString.decompressFromBase64($('#__VIEWSTATE').val());
        if (n) {
            $('#erroraudit_show').replaceWith(n);
            $('#__VIEWSTATE').remove();
        }
    }

    const bookTitle = $('.book-title > h1').text();
    const bookIntro = $('#intro-all').text();
    const coverImgSrc = $('.book-cover img').attr('src');
    const chapters = getChapters($);

    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        description: `
            <h1>${chapter.num}</h1>
            <img src="${coverImgSrc}" />
        `.trim(),
    });
    ctx.state.data = {
        title: `看漫画 - ${bookTitle}`,
        link: `https://www.manhuagui.com/comic/${id}/`,
        description: bookIntro,
        item: chapters.map(genResult),
    };
};
