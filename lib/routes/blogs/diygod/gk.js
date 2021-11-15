import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://diygod.me/gk',
    });

    const $ = cheerio.load(data);
    const list = $('.gk-item');

    ctx.state.data = {
        title: 'DIYgod 的可爱的手办们',
        link: 'https://diygod.me/gk',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.find('.gk-desc p').eq(0).text().slice(3);
                    return {
                        title,
                        description: item.html(),
                        link: 'https://diygod.me/gk',
                        guid: title,
                    };
                })
                .get(),
    };
};
