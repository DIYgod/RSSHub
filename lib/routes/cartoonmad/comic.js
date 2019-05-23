const { resolve } = require('url');
const cheerio = require('cheerio');
const axios = require('@/utils/axios');
const iconv = require('iconv-lite');

const getChapters = (id, $) =>
    $('#info')
        .eq(1)
        .find('a')
        .map((_, ele) => {
            const a = $(ele);
            const link = resolve('https://www.cartoonmad.com/', a.attr('href'));
            const title = a.text();
            const num = a.next('font').text();
            let contentBody = '';
            for (let page = 1; page <= parseInt(/\d+/.exec(num)); page++) {
                contentBody += `<img referrerpolicy="no-referrer" src="http://web.cartoonmad.com/home75458/${id}/${title.split(' ')[1]}/${(Array(3).join(0) + page).slice(-3)}.jpg" /></br>`;
            }

            return {
                link,
                title,
                num,
                contentBody,
            };
        })
        .toArray()
        .reverse();

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { data } = await axios.get(`https://www.cartoonmad.com/comic/${id}`, {
        responseType: 'arraybuffer',
        headers: {
            Host: 'www.cartoonmad.com',
            Referer: 'https://www.cartoonmad.com/',
        },
    });
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
    // const coverImgSrc = $('.cover')
    //     .parent()
    //     .find('img')
    //     .attr('src');
    const chapters = getChapters(id, $);

    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        description: chapter.contentBody,
    });
    ctx.state.data = {
        title: `動漫狂 - ${bookTitle}`,
        link: `https://www.cartoonmad.com/comic/${id}`,
        description: bookIntro,
        item: chapters.map(genResult),
    };
};
