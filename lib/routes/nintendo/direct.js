import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://www.nintendo.com/nintendo-direct/archive/',
    });

    const $ = cheerio.load(data);
    const list = $('.news-tiles li').get().slice(0, 9);

    const result = list.map((item) => {
        const $ = cheerio.load(item);
        return {
            title: $('.b7').html(),
            cover: $('img ').attr('src').replace('../', 'https://www.nintendo.com/nintendo-direct/'),
            des: $('p').html(),
            url: $('a').attr('href').replace('../', 'https://www.nintendo.com/nintendo-direct/'),
        };
    });

    ctx.state.data = {
        title: `Nintendo Direct (任天堂直面会)`,
        link: `https://www.nintendo.com/nintendo-direct/archive/`,
        description: `最新的任天堂直面会日程信息`,
        item: result.map((item) => ({
            title: item.title,
            description: `<img src="${item.cover}" /><br>${item.des}`,
            link: item.url,
        })),
    };
};
