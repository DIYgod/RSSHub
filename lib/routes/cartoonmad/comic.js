const { resolve } = require('url');
const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const iconv = require('iconv-lite');

const getChapters = ($) =>
    $('#info')
        .eq(1)
        .find('a')
        .map((_, ele) => {
            const a = $(ele);
            return {
                link: resolve('https://www.cartoonmad.com/', a.attr('href')),
                title: a.text(),
                num: a
                    .parent()
                    .find('font')
                    .text(),
            };
        })
        .toArray();

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { data } = await axios.get(`https://www.cartoonmad.com/comic/${id}`, { responseType: 'arraybuffer' });
    const content = iconv.decode(new Buffer.from(data), 'big5');
    const $ = cheerio.load(content);

    const bookTitle = $('title')
        .text()
        .match(/\S+/)[0];
    const bookIntro = $('#info')
        .eq(0)
        .find('td')
        .text()
        .trim();
    const coverImgSrc = $('.cover')
        .parent()
        .find('img')
        .attr('src');
    const chapters = getChapters($);

    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        description: `
            <h1>${chapter.num}</h1>
            <img referrerpolicy="no-referrer" src="${coverImgSrc}" />
        `.trim(),
    });
    ctx.state.data = {
        title: `動漫狂 - ${bookTitle}`,
        link: `https://www.cartoonmad.com/comic/${id}`,
        description: bookIntro,
        item: chapters.map(genResult),
    };
};
