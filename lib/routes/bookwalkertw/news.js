const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.bookwalker.com.tw/more/index/1',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div[class="bwbookitem"]');
    let bookid;
    ctx.state.data = {
        title: 'BOOKWALKERTW热门新书',
        link: 'https://www.bookwalker.com.tw/more/index/1',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    bookid = item.find('a').attr('href').substring(38, 43);
                    return {
                        title: item.find('.bookname').text(),
                        description: `${item.find('.booknamesub').text()}&nbsp;|&nbsp;${item.find('.bprice').text()}<br><img src="https://image.bookwalker.com.tw/upload/product/${bookid}/zoom_big_${bookid}.jpg">`,
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
