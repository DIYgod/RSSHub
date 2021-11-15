import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.nikkei.com';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('div[data-rn-track-category]')
        .map((_, e) => {
            const element = $(e);
            const {
                title
            } = element.data('rn-track-value');
            const link = url + element.find('a').attr('href');

            const src = element.find('img').attr('src');
            const dataSrc = element.find('img').attr('data-src');

            const imgSrc = dataSrc || src;
            const desc = `<img src="${imgSrc}" />` + element.find('div .k-card__excerpt');

            return {
                title,
                description: desc,
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: '日本経済新聞',
        link: url,
        item: list,
    };
};
