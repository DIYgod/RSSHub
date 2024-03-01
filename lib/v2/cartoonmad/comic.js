const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.cartoonmad.com';
const KEY = '5e585';

const load = (id, { chapter, pages }) => {
    let description = '';
    for (let page = 1; page <= pages; page++) {
        const url = `${baseUrl}/${KEY}/${id}/${chapter}/${String(page).padStart(3, '0')}.jpg`;
        description += art(path.join(__dirname, 'templates/chapter.art'), {
            url,
        });
    }
    return description;
};

const getChapters = (id, list, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, () => {
                item.description = load(id, item);

                return item;
            })
        )
    );

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${baseUrl}/comic/${id}`;

    const { data } = await got(link, {
        responseType: 'buffer',
        headers: {
            Referer: 'https://www.cartoonmad.com/',
        },
    });
    const content = iconv.decode(data, 'big5');
    const $ = cheerio.load(content);

    const bookIntro = $('#info').eq(0).find('td').text().trim();
    // const coverImgSrc = $('.cover').parent().find('img').attr('src');
    const list = $('#info')
        .eq(1)
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${baseUrl}${item.attr('href')}`,
                chapter: item.text().match(/\d+/)[0],
                pages: item.next('font').text().match(/\d+/)[0],
            };
        })
        .reverse();

    const chapters = await getChapters(id, list, ctx.cache.tryGet);

    ctx.state.data = {
        title: $('head title').text(),
        link,
        description: bookIntro,
        item: chapters,
    };
};
