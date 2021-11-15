import got from '~/utils/got.js';
import cheerio from 'cheerio';
import utils from './utils.js';

export default async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.huxiu.com/collection/${id}.html`;

    const {
        data
    } = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });
    const $ = cheerio.load(data);

    const list = $('.collection__article-list__item > a')
        .filter('.article-item')
        .slice(0, 5)
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅 - ${$('h1').text()}`;
    const description = $('p').text();
    ctx.state.data = {
        title: info,
        link,
        description,
        item: items,
    };
};
