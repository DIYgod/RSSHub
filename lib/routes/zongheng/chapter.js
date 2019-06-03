const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const [$, $home] = (await Promise.all([got.get(`http://book.zongheng.com/showchapter/${id}.html`), got.get(`http://book.zongheng.com/book/${id}.html`)])).map((res) => cheerio.load(res.data));
    const date_re = /更新时间：(.*)$/;
    const cover_url = $home('.book-img img').attr('src');
    const description = $home('.book-dec').text();
    const name = $('.book-meta h1').text();

    const chapters = $('.volume-list li a');
    const items = [];
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters.eq(i);
        const date_string = date_re.exec(chapter.attr('title'))[1];

        items.push({
            title: chapter.text(),
            pubDate: new Date(date_string).toUTCString(),
            link: chapter.attr('href'),
        });
    }

    ctx.state.data = {
        title: `纵横 ${name}`,
        link: `http://book.zongheng.com/book/${id}.html`,
        description,
        image: cover_url,
        item: items,
    };
};
