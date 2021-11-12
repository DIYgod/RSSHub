const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const getChapters = (id, $, caches) => {
    const chapters = $('.text')
        .toArray()
        .reduce((acc, curr) => acc.concat(`http://www.haimaoba.com${$(curr).children('a').attr('href')}`), []);

    return Promise.all(
        chapters.splice(0, 10).map((link) =>
            caches.tryGet(link, async () => {
                const { data } = await got.get(link, {
                    responseType: 'buffer',
                    host: 'www.haimaoba.com',
                    Referer: `http://www.haima.com/catalog/${id}/`,
                });
                const content = iconv.decode(new Buffer.from(data), 'gb2312');
                const $ = cheerio.load(content);
                return {
                    title: $('head > title').text(),
                    link,
                    description: $('.contentimg').html(),
                };
            })
        )
    );
};

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const { data } = await got.get(`http://www.haimaoba.com/catalog/${id}/`, {
        responseType: 'buffer',
        Host: 'www.haimaoba.com',
        Referer: 'http://www.haimaoba.com/',
    });
    const content = iconv.decode(new Buffer.from(data), 'gb2312');
    const $ = cheerio.load(content);

    const bookTitle = $('.t > h1').text();
    const bookIntro = $('#zuop1C').text();
    const chapters = await getChapters(id, $, ctx.cache);

    const rssData = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        description: chapter.description,
    });

    ctx.state.data = {
        title: `海猫吧 - ${bookTitle}`,
        link: `http://www.haimaoba.com/catalog/${id}/`,
        description: bookIntro,
        item: chapters.map(rssData),
    };
};
