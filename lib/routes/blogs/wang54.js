import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        id = 2020
    } = ctx.params;
    const url = `https://wangwusiwj.blogspot.com/${id}`;
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('div.post')
        .map((i, e) => ({
            title: $(e).find('h3 > a').text(),
            description: $(e).find('.post-body').html(),
            link: $(e).find('h3 > a').attr('href'),
            author: '王五四',
        }))
        .get();

    ctx.state.data = {
        title: '王五四文集',
        link: url,
        item: list,
    };
};
