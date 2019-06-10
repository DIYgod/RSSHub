const cheerio = require('cheerio');
const got = require('@/utils/got');
const domain = 'https://www.dongmanmanhua.cn';

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const name = ctx.params.name;
    const id = ctx.params.id;

    const comicLink = `${domain}/${category}/${name}/list?title_no=${id}`;
    const { data } = await got.get(comicLink);
    const $ = cheerio.load(data);

    const bookName = $('.detail_header .info .subj').text();
    const title = $('#_listUl span.subj')
        .map(function() {
            return $(this).text();
        })
        .get();
    const date = $('#_listUl span.date')
        .map(function() {
            return $(this)
                .text()
                .replace(/\n|\r|\t/g, '');
        })
        .get();
    const link = $('#_listUl > li > a')
        .map(function() {
            return 'https:' + $(this).attr('href');
        })
        .get();
    const resultItem = title.map((t, i) => ({
        title: t,
        pubDate: new Date(date[i]).toUTCString(),
        link: link[i],
        description: `<a href=${link[i]} target="_blank">${t}</a>`,
    }));

    ctx.state.data = {
        title: `咚漫 ${bookName}`,
        link: comicLink,
        description: `咚漫 ${bookName}`,
        item: resultItem,
    };
};
