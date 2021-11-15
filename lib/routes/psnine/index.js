import got from '~/utils/got.js';
import cheerio from 'cheerio';
import date from '~/utils/date.js';

export default async (ctx) => {
    const url = 'https://www.psnine.com/';

    const {
        data
    } = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(data);

    const out = $('.list li')
        .slice(0, 20)
        .map(function () {
            const info = {
                title: $(this).find('.title').text(),
                link: $(this).find('.title a').attr('href'),
                pubDate: date($(this).find('.meta').text()),
                author: $(this).find('.meta a').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: 'psnine-' + $('title').text(),
        link: 'https://www.psnine.com/',
        item: out,
    };
};
