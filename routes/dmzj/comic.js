const axios = require('../../utils/axios');
const cheerio = require('cheerio');

function process(chapters, items) {
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters.eq(i);
        items.push({
            title: chapter.text(),
            link: `https://manhua.dmzj.com${chapter.attr('href')}`,
        });
    }
}

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://manhua.dmzj.com/${id}/`,
    });
    const $ = cheerio.load(response.data);

    const name = $('.anim_title_text h1').text();
    const cover_url = $('.anim_intro_ptext img').attr('src');

    const main_chapters = $('.cartoon_online_border li a');
    const other_chapters = $('.cartoon_online_border_other li a');

    const items = [];

    process(main_chapters, items);
    process(other_chapters, items);

    ctx.state.data = {
        title: `动漫之家 ${name}`,
        link: `https://manhua.dmzj.com/${id}/`,
        description: $('.middleright_mr margin_top_10px .line_height_content').text(),
        image: cover_url,
        item: items,
    };
};
