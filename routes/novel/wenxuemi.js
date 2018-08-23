const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const mbaseUrl = 'https://m.wenxuemi.com/files/article/html';
const baseUrl = 'https://www.wenxuemi.com';

// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const id1 = ctx.params.id1; // 小说id
    const id2 = ctx.params.id2;
    const id = '/' + id1 + '/' + id2;
    const axios_ins = axios.create({
        headers: {
            Referer: `${mbaseUrl}${id}/`,
        },
        responseType: 'arraybuffer',
    });
    const response = await axios_ins.get(`${mbaseUrl}${id}/`);
    const responseHtml = iconv.decode(response.data, 'GBK');
    const $ = cheerio.load(responseHtml);

    const title = $('h2', '.block_txt2')
        .find('a')
        .text();
    const description = $('.intro_info').text();
    const cover_url = $('img', '.block_img2').attr('src');
    const list = $('li', '.chapter').slice(0, 5);
    const items = [];
    for (let i = 0; i < list.length; i++) {
        // title: e.children[0].data,
        // link: e.attribs.href,
        const link =
            baseUrl +
            $(list[i])
                .find('a')
                .attr('href');
        const articleHtml = await axios_ins.get(link);
        const article = iconv.decode(articleHtml.data, 'GBK');
        const $1 = cheerio.load(article);
        const res = $1('div#content').text();
        const item = {
            title: $(list[i]).text(),
            description: res,
            link: link,
        };
        items.push(item);
    }
    ctx.state.data = {
        title: `${title}`,
        link: `${baseUrl}/files/article/html${id}/`,
        image: cover_url,
        description: description,
        item: items,
    };
};
