const got = require('@/utils/got');
const cheerio = require('cheerio');
const LZString = require('lz-string');
const { resolve } = require('url');

const getChapters = ($) => {
    let time_mark = 0;
    const jq = new RegExp($.category + ' > ul:nth-child(1)');
    // console.log($(jq).toArray());
    return $(jq)
        .toArray()
        .reduce((acc, curr) => acc.concat($(curr).children('a').toArray()), [])
        .reverse()
        .map((ele) => {
            const a = $(ele);
            // 通过操作发布时间来对章节进行排序,如果是刚刚更新的单行本或者番外,保留最新更新时间
            const pDate = new Date(new Date($.pubDate) - time_mark++);
            return {
                link: resolve('https://www.copymanga.com/', a.attr('href')),
                title: a.attr('title'),
                pub_date: pDate,
                guid: a.attr('href'),
                category: $.category,
            };
        });
};
module.exports = async (ctx) => {
    const { id } = ctx.params;
    const { chapterCnt } = Number(ctx.params.chapterCnt || 0);
    // eslint-disable-next-line no-unused-vars
    const { categoryName } = Number(ctx.params.categoryName || 0);
    const { data } = await got.get(`https://www.copymanga.com/comic/${id}`);
    const $ = cheerio.load(data);
    const chapterEnum = {
        0: [$('#default全部 > ul:nth-child(1)'), '#default全部'],
        1: [$('#default話 > ul:nth-child(1)', '#default話')],
        2: [$('#default卷 > ul:nth-child(1)', '#default卷')],
    };
    if ($('#__VIEWSTATE').length > 0) {
        const n = LZString.decompressFromBase64($('#__VIEWSTATE').val());
        if (n) {
            $('#erroraudit_show').replaceWith(n);
            $('#__VIEWSTATE').remove();
        }
    }
    const bookTitle = $('div.col-9.comicParticulars-title-right h6').text();
    const bookIntro = $('div.container.comicParticulars-synopsis p').text();
    const coverImgSrc = $('div.col-auto.comicParticulars-title-left img').attr('src');
    const pub_date_str = $('.comicParticulars-sigezi+span.comicParticulars-right-txt').text();
    // 为了能在闭包内访问到这个日期而不是每次需要处理这个最近更新日期
    $.pubDate = new Date(pub_date_str).toUTCString();
    $.category = chapterEnum[ctx.params.categoryName.toString()][1];
    // console.log($.category);
    const chapters = getChapters($);
    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        pubDate: chapter.pub_date,
        guid: chapter.guid,
        category: chapter.category,
        description: `
        <h1>${chapter.title}</h1>
        <img src='${coverImgSrc}' />
    `.trim(),
    });
    // console.log(chapters);
    const items = chapters.map(genResult);
    let itemsLen = items.length;
    if (chapterCnt > 0) {
        itemsLen = chapterCnt < itemsLen ? chapterCnt : itemsLen;
    }
    ctx.state.data = {
        title: `${bookTitle} - 拷贝漫画`,
        link: `https://www.copymanga.com/comic/${id}/`,
        description: bookIntro,
        item: items.slice(0, itemsLen),
    };
};
