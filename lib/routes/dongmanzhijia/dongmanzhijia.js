const cheerio = require('cheerio');
const got = require('@/utils/got');

const baseURL = 'http://manhua.dmzj.com';

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const targetURL = `${baseURL}/${name}`;

    const { data } = await got.get(targetURL);
    const $ = cheerio.load(data);

    const bookTitle = $('.anim_title_text a').text();
    const bookIntro = $('.middleright_mr.margin_top_10px .line_height_content')
        .text()
        .trim();
    const coverImgSrc = $('.anim_intro_ptext img').attr('src');

    const items = $('.cartoon_online_border ul li a')
        .map((i, d) => ({
            link: baseURL + $(d).attr('href'),
            title: $(d).text(),
            description: `
                <h1>${$(d).text()}</h1>
                <img src="${coverImgSrc}" />
            `,
        }))
        .get();

    ctx.state.data = {
        title: `动漫之家 - ${bookTitle}`,
        link: targetURL,
        description: bookIntro,
        item: items,
    };
};
