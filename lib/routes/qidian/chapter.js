const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://book.qidian.com/info/${id}#Catalog`,
    });
    const $ = cheerio.load(response.data);

    const name = $('.book-info>h1>em').text();
    const cover_url = 'https:' + $('#bookImg>img').attr('src');

    const csrfToken = response.headers['set-cookie'].find((s) => s.startsWith('_csrfToken=')).split(';')[0];

    const chapters_response = await got({
        method: 'get',
        url: `https://book.qidian.com/ajax/book/category?${csrfToken}&bookId=${id}`,
    });
    const chapter_item = [];

    for (let i = 0; i < chapters_response.data.data.vs.length; i++) {
        const chapters = chapters_response.data.data.vs[i].cs;
        for (let j = 0; j < chapters.length; j++) {
            const chapter = chapters[j];
            chapter_item.push({
                title: chapter.cN,
                pubDate: new Date(chapter.uT).toUTCString(),
                link: `https://vipreader.qidian.com/chapter/${id}/${chapter.id}`,
            });
        }
    }

    ctx.state.data = {
        title: `起点 ${name}`,
        link: `https://book.qidian.com/info/${id}`,
        description: $('.book-info>p.intro').text(),
        image: cover_url,
        item: chapter_item,
    };
};
