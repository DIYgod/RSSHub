import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://www.gamersky.com/news/',
        headers: {
            Referer: 'https://www.gamersky.com/news/',
        },
    });
    const $ = cheerio.load(data);

    const out = $('.Mid2L_con li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('.tt').text(),
                link: $(this).find('.tt').attr('href'),
                pubDate: new Date($(this).find('.time').text()).toUTCString(),
                description: $(this).find('.txt').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '游民星空-今日推荐',
        link: 'https://www.gamersky.com/news/',
        item: out,
    };
};
