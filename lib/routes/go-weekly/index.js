import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const url = 'https://studygolang.com/go/weekly';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('.title')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('a');
            const title = $link.text();
            const link = $link.attr('href');
            return {
                title,
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: 'Go语言爱好者周刊',
        link: url,
        item: resultItem,
    };
};
