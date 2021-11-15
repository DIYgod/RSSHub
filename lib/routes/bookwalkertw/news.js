import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://www.bookwalker.com.tw/search?order=sell_desc&series_display=1&d=1',
    });

    const $ = cheerio.load(data);
    const list = $('div[class="bwbookitem"]');
    let bookid;
    ctx.state.data = {
        title: 'BOOKWALKERTW热门新书',
        link: 'https://www.bookwalker.com.tw/search?order=sell_desc&series_display=1&d=1',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    bookid = item.find('img').attr('data-src').split('/')[5];
                    return {
                        title: item.find('.bookname').text(),
                        description: `${item.find('.booknamesub').text()}&nbsp;|&nbsp;${item.find('.bprice').text()}<br><img src="https://image.bookwalker.com.tw/upload/product/${bookid}/zoom_big_${bookid}.jpg">`,
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
