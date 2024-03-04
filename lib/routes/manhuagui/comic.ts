// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
const LZString = require('lz-string');
import { parseDate } from '@/utils/parse-date';

let baseUrl = '';

const getChapters = ($) => {
    let time_mark = 100;
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
                .reduce((acc, curr) => [...acc, ...$(curr).children('li').toArray()], [])
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
                        link: new URL(a.attr('href'), baseUrl).href,
                        title: a.attr('title'),
                        pub_date: pDate,
                        num: a.find('i').text(),
                        category: categoryName,
                    };
                });
        })
        .reduce((acc, curr) => [...acc, ...curr]);
};

export default async (ctx) => {
    const { id, domain } = ctx.req.param();
    if (domain === 'mhgui') {
        baseUrl = 'https://www.mhgui.com';
    } else if (domain === 'twmanhuagui') {
        baseUrl = 'https://tw.manhuagui.com';
    } else {
        baseUrl = 'https://www.manhuagui.com';
    }

    const chapterCnt = Number(ctx.req.param('chapterCnt') || 0);
    const { data } = await got(`${baseUrl}/comic/${id}/`);
    const $ = load(data);

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
    const reg = /最近[于於].+更新至/;
    // 处理已下架的漫画
    if ($('.status > span').text().indexOf('已下架') > 0) {
        ctx.set('data', {
            title: `看漫画 - ${bookTitle} 已下架`,
            link: `${baseUrl}/comic/${id}/`,
            description: bookIntro,
            item: [{ link: `${baseUrl}/comic/${id}/`, title: bookTitle, description: '已下架' }],
        });
    } else {
        const pub_date_str = $('.status > span')
            .text()
            .match(reg)[0]
            .replace(/最近[于於] \[/, '')
            .replace('] 更新至', '');
        // 为了能在闭包内访问到这个日期而不是每次需要处理这个最近更新日期
        $.pubDate = parseDate(pub_date_str);
        $.newChapterCnt = 0;
        const chapters = getChapters($);
        const genResult = (chapter) => ({
            link: chapter.link,
            title: chapter.title,
            pubDate: chapter.pub_date,
            category: chapter.category,
            description: `
            <h1>${chapter.num}</h1>
            <img src='${coverImgSrc}' />
        `.trim(),
        });
        const items = chapters.map((element) => genResult(element));
        let itemsLen = items.length;
        if (chapterCnt > 0) {
            itemsLen = chapterCnt < $.newChapterCnt ? $.newChapterCnt : chapterCnt;
        }

        ctx.set('data', {
            title: `看漫画 - ${bookTitle}`,
            link: `${baseUrl}/comic/${id}/`,
            description: bookIntro,
            item: items.slice(0, itemsLen),
        });
    }
};
