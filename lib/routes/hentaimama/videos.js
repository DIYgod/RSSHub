import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'http://hentaimama.io/recent-episodes/',
    });

    const $ = cheerio.load(data);
    const list = $('.item.episodes');

    ctx.state.data = {
        title: 'Hentaimama - Recent Videos',
        link: 'http://hentaimama.io/recent-episodes/',
        language: 'en-us',
        item: list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('img').attr('alt'),
                    description: '<img src="' + item.find('img').attr('src') + '">',
                    pubDate: item.find('.data span').text(),
                    guid: new Date(item.find('.data span').text()),
                    link: item.find('a').attr('href'),
                };
            })
            .get(),
    };
};
