const { resolve } = require('url');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const LZString = require('lz-string');

const getChapters = ($) => {
    let time_mark = 0;
    // 用于一次更新多个新章节的排序
    let new_time_mark = 0;
    return $('h4')
        .toArray()
        .map((ele) => {
            const categoryName = $(ele).text();
            while (!$(ele.next).hasClass('chapter-list')) {
                ele = ele.next;
            }
            ele = ele.next;
            return $(ele)
                .children('ul')
                .toArray()
                .reverse()
                .reduce((acc, curr) => acc.concat($(curr).children('li').toArray()), [])
                .map((ele) => {
                    const a = $(ele).children('a');
                    // 通过操作发布时间来对章节进行排序,如果是刚刚更新的单行本或者番外,保留最新更新时间
                    let pDate = new Date(new Date($.pubDate) - time_mark++ * 1000);
                    if (a.find('em').length > 0) {
                        // 对更新的章节也进行排序
                        pDate = new Date(new Date($.pubDate) - new_time_mark++ * 1000);
                        $.newChapterCnt++;
                    }
                    return {
                        link: resolve('https://www.mhgui.com/', a.attr('href')),
                        title: a.attr('title'),
                        pub_date: pDate,
                        num: a.find('i').text(),
                        guid: resolve('https://www.mhgui.com/', a.attr('href')),
                        category: categoryName,
                    };
                });
        })
        .reduce((acc, curr) => acc.concat(curr));
};
module.exports = async (ctx) => {
    const { id } = ctx.params;
    const chapterCnt = Number(ctx.params.chapterCnt || 0);
    const { data } = await got.get(`https://www.mhgui.com/comic/${id}/`);
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
    // 对最新更新的章节增加了pubDate
    const reg = new RegExp('最近于.+更新至');
    // 处理已下架的漫画
    if ($('.status > span').text().indexOf('已下架') > 0) {
        ctx.state.data = {
            title: `看漫画 - ${bookTitle} 已下架`,
            link: `https://www.mhgui.com/comic/${id}/`,
            description: bookIntro,
            item: [{ link: `https://www.mhgui.com/comic/${id}/`, title: bookTitle, description: '已下架' }],
        };
    } else {
        const pub_date_str = $('.status > span').text().match(reg)[0].replace('最近于 [', '').replace('] 更新至', '');
        // 为了能在闭包内访问到这个日期而不是每次需要处理这个最近更新日期
        $.pubDate = new Date(pub_date_str).toUTCString();
        $.newChapterCnt = 0;
        const chapters = getChapters($);
        const genResult = (chapter) => ({
            link: chapter.link,
            title: chapter.title,
            pubDate: chapter.pub_date,
            guid: chapter.guid,
            category: chapter.category,
            description: `
            <h1>${chapter.num}</h1>
            <img src='${coverImgSrc}' />
        `.trim(),
        });
        const items = chapters.map(genResult);
        let itemsLen = items.length;
        if (chapterCnt > 0) {
            itemsLen = chapterCnt < $.newChapterCnt ? $.newChapterCnt : chapterCnt;
        }
        ctx.state.data = {
            title: `看漫画 - ${bookTitle}`,
            link: `https://www.mhgui.com/comic/${id}/`,
            description: bookIntro,
            item: items.slice(0, itemsLen),
        };
    }
};
