const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
module.exports = async (ctx) => {
    const link = 'http://graduate.bjfu.edu.cn/pygl/pydt/index.html';
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const list = $('.itemList li').slice(0, 10);

    ctx.state.data = {
        title: '北林研培养动态',
        link: link,
        description: '北京林业大学研究生院培养动态',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('li a').text(), description: item.find('li a').text(), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
