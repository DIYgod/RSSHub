const { resolve } = require('url');
const cheerio = require('cheerio');

const getChapters = ($) =>
    $('.tab-content > div > ul')
        .toArray()
        .reverse()
        .reduce((acc, curr) => acc.concat($(curr).children('a').toArray()), [])
        .map((ele) => {
            const a = $(ele);
            return {
                link: resolve('https://copymanga.com', a.attr('href')),
                title: a.attr('title'),
            };
        });

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    const link = `https://copymanga.com/comic/${id}`;
    await page.goto(link);
    const html = await page.evaluate(() => document.querySelector('body').innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    const bookTitle = $('.comicParticulars-title-right > ul > li > h6').text();
    const bookIntro = $('.intro').text();
    const coverImgSrc = $('.comicParticulars-left-img > img').attr('data-src');
    const chapters = getChapters($);
    chapters.reverse();

    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        description: `
            <h1>${chapter.title}</h1>
            <img src="${coverImgSrc}" />
        `.trim(),
    });
    ctx.state.data = {
        title: `拷贝漫画 - ${bookTitle}`,
        link: `https://copymanga.com/comic/${id}`,
        description: bookIntro,
        item: chapters.map(genResult),
    };
};
