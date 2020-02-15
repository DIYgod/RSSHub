const { resolve } = require('url');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');

const load = ($, baseUrl) => {
    const num = $.next('font').text();
    const pages = Number.parseInt(/\d+/.exec(num)[0], 10);

    let description = '';
    for (let page = 1; page <= pages; page++) {
        description += `<img src="${baseUrl}/${String(page).padStart(3, '0')}.jpg" /></br>`;
    }
    return {
        description,
    };
};

const getChapters = async (id, $, caches) => {
    const chapters = $('#info')
        .eq(1)
        .find('a');

    return await Promise.all(
        chapters
            .slice(chapters.length - 10, chapters.length)
            .map(async (_, ele) => {
                const a = $(ele);
                const link = resolve('https://www.cartoonmad.com/', a.attr('href'));
                const title = a.text();

                const single = {
                    link,
                    title,
                };
                const other = await caches.tryGet(link, () => load(a, `https://www.cartoonmad.com/home75458/${id}/${title.split(' ')[1]}`));
                return Promise.resolve(Object.assign({}, single, other));
            })
            .toArray()
            .reverse()
    );
};

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { data } = await got.get(`https://www.cartoonmad.com/comic/${id}`, {
        responseType: 'buffer',
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
    const chapters = await getChapters(id, $, ctx.cache);

    ctx.state.data = {
        title: `動漫狂 - ${bookTitle}`,
        link: `https://www.cartoonmad.com/comic/${id}`,
        description: bookIntro,
        item: chapters,
    };
};
