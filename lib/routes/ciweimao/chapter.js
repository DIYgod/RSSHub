const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `http://www.ciweimao.com/chapter-list/${id}/book_detail`,
    });
    const $ = cheerio.load(response.data);

    const name = $('.book-catalog>.hd>h3').text();

    const chapter_item = [];

    $('.book-chapter>.book-chapter-box>ul>li>a').each(function () {
        chapter_item.push({
            title: $(this).text(),
            link: $(this).attr('href'),
        });
    });

    ctx.state.data = {
        title: `刺猬猫 ${name}`,
        link: `http://www.ciweimao.com/book/${id}`,
        item: chapter_item,
    };
};
