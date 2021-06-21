const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const selector = cheerio.load((await got.get(`https://www.ciweimao.com/book/${id}`)).data);
    const name = selector('.book-info h3.title').text();
    const description = selector('.book-intro').html();

    const response = await got({
        method: 'post',
        url: `https://www.ciweimao.com/chapter/get_chapter_list_in_chapter_detail`,
        form: {
            book_id: id,
            chapter_id: 0,
            orderby: 0,
        },
    });
    const $ = cheerio.load(response.data);

    const item = $('.book-chapter-box>ul>li>a')
        .map((index, ele) => ({
            title: $(ele).text(),
            link: $(ele).attr('href'),
        }))
        .get();

    ctx.state.data = {
        title: `刺猬猫 ${name}`,
        link: `http://www.ciweimao.com/book/${id}`,
        description,
        item,
    };
};
