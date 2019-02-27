const axios = require('../../utils/axios');
const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const base_url = 'http://www.zzrbl.com';
    const type = ctx.params.type;
    let url, category;
    switch (type) {
        case '1':
            url = `${base_url}/wordpress/?cat=11`;
            category = "日剧";
            break;
        case '2':
            url = `${base_url}/wordpress/?cat=12`;
            category = "日影";
            break;
        case '3':
            url = `${base_url}/wordpress/?cat=32`;
            category = "其它";
            break;
        default:
            url = `${base_url}/wordpress/?cat=11`;
            category = "日剧";
            break;
    }

    const html = (await axios.get(url)).data;
    const $ = cheerio.load(html);

    const list = $('div.section_body > ul > li');

    ctx.state.data = {
        title: `猪猪字幕组最近更新 - ${category}`,
        link: url,
        item: list
            .map((_, el) => {
                const item = $(el).find('span[class="title"]');

                return {
                    title: item
                        .find('a')
                        .attr('title'),
                    description: item
                        .find('p[class="intro"]')
                        .text(),
                    link: item
                        .find('a')
                        .attr('href'),
                };
            })
            .get(),
    };
};
