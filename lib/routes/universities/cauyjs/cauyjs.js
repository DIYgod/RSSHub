const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://yz.cau.edu.cn/infoArticleList.do?sortColumn=publicationDate&pagingNumberPer=20&columnId=10423&sortDirection=-1&pagingPage=2&';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.articleList ul li').slice(0, 10);

    ctx.state.data = {
        title: '中农研究生学院',
        link: link,
        description: '中农研究生学院',
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
