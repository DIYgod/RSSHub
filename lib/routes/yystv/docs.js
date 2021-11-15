import got from '~/utils/got.js';
import cheerio from 'cheerio';
import date from '~/utils/date';

export default async (ctx) => {
    const url = `https://www.yystv.cn/docs`;

    const {
        data
    } = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(data);

    const items = $('.list-container li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $('.list-article-title', this).text(),
                link: 'https://www.yystv.cn' + $('a', this).attr('href'),
                pubDate: date($('.c-999', this).text()),
                author: $('.handler-author-link', this).text(),
                description: $('.list-article-intro', this).text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/docs`,
        item: items,
    };
};
