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
            // 增加了GUID
            const pDate = $.pubDate;
            return {
                link: resolve('https://www.manhuagui.com/', a.attr('href')),
                title: a.attr('title'),
                pub_date: pDate,
                num: a.find('i').text(),
                guid: resolve('https://www.manhuagui.com/', a.attr('href'))
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
    // 对最新更新的章节增加了pubDate
    const reg = new RegExp('最近于.+更新至');
    const pub_date_str = $('.status > span').text().match(reg)[0]
        .replace('最近于 [', '').replace('] 更新至', '');
    // 为了能在闭包内访问到这个日期而不是每次需要处理这个最近更新日期
    $.pubDate = new Date(pub_date_str).toUTCString();
    const bookTitle = $('.book-title > h1').text();
    const bookIntro = $('#intro-all').text();
    const coverImgSrc = $('.book-cover img').attr('src');
    const chapters = getChapters($);

    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        pubDate: chapter.pub_date,
        guid: chapter.guid,
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
