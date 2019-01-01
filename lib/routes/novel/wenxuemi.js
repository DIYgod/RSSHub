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

    const resultItems = await Promise.all(
        list.toArray().map(async (item) => {
            const $item = $(item);

            const link = baseUrl + $item.find('a').attr('href');
            let resultItem = {};
            const value = await ctx.cache.get(link);
            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const articleHtml = await axios_ins.get(link);
                const article = iconv.decode(articleHtml.data, 'GBK');
                const $1 = cheerio.load(article);
                const res = $1('div#content').html();

                resultItem = {
                    title: $item.text(),
                    description: res,
                    link: link,
                };
                if (res.slice(0, 10).includes('正在手打中') === false) {
                    ctx.cache.set(link, JSON.stringify(resultItem), 24 * 60 * 60);
                }
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `${title}`,
        link: `${baseUrl}/files/article/html${id}/`,
        image: cover_url,
        description: description,
        item: resultItems,
    };
};
