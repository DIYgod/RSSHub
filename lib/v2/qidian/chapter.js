const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://m.qidian.com/book/${id}.html`);
    const $ = cheerio.load(response.data);

    const name = $('.book-detail-info .book-title').text();
    const cover_url = 'https:' + $('.book-detail-info img').attr('src');

    const csrfToken = await got(`https://m.qidian.com/book/${id}/catalog/`).then((res) => res.headers['set-cookie'].join('').match(/_csrfToken=(\S*);/)[0]);
    const chapters_response = await got(`https://m.qidian.com/majax/book/category?${csrfToken}&bookId=${id}`);
    const chapter_item = [];

    for (let i = 0; i < chapters_response.data.data.vs.length; i++) {
        const chapters = chapters_response.data.data.vs[i].cs;
        for (let j = 0; j < chapters.length; j++) {
            const chapter = chapters[j];
            chapter_item.push({
                title: chapter.cN,
                pubDate: parseDate(chapter.uT),
                link: `https://vipreader.qidian.com/chapter/${id}/${chapter.id}`,
            });
        }
    }

    ctx.state.data = {
        title: `起点 ${name}`,
        link: `https://book.qidian.com/info/${id}`,
        description: $('#bookSummary content').text(),
        image: cover_url,
        item: chapter_item,
    };
};
