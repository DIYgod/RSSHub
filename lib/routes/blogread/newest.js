import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const url = 'http://blogread.cn/news/newest.php';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('.media')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('dt a');

            return {
                title: $link.text(),
                description: elem.find('dd').eq(0).text(),
                link: $link.attr('href'),
                author: elem.find('.small a').eq(0).text(),
            };
        })
        .get();

    ctx.state.data = {
        title: '技术头条',
        link: url,
        item: resultItem,
    };
};
