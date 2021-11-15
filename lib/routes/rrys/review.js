import got from '~/utils/got.js';
import cheerio from 'cheerio';

const baseURL = 'http://www.rrys2019.com';

export default async (ctx) => {
    const response = await got.get(baseURL + '/article');

    const $ = cheerio.load(response.data);
    const list = $('.article-list li');
    ctx.state.data = {
        title: '人人影视-评测推荐',
        link: baseURL + '/article',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPicUrl = item.find('.fl-img img').attr('src');
                    const [itemDesc] = item.find('.fl-info p').text().split('By');
                    return {
                        title: item.find('.fl-info h3 a').text(),
                        author: item.find('.fl-info p a').text(),
                        description: `描述：${itemDesc}<br><img src="${itemPicUrl}">`,
                        link: baseURL + item.find('.fl-info h3 a').attr('href'),
                    };
                })
                .get(),
    };
};
