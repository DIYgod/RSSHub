const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://cie.nwafu.edu.cn/dtytz/tzgg/index.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#sort > dd > ul > li');

    ctx.state.data = {
        title: '西北农林科技大学 - 信工学院公告',
        link: 'https://cie.nwafu.edu.cn/dtytz/tzgg/index.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('li a').text(), description: item.find('li a').text(), pubDate: item.find('span').text(), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
