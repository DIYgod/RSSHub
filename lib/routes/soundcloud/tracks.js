import got from '~/utils/got.js';
import cheerio from 'cheerio';
import util from './utils.js';

export default async (ctx) => {
    const {
        user
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: `https://soundcloud.com/${user}/tracks`,
        headers: {
            Referer: `https://soundcloud.com/${user}/tracks`,
        },
    });

    const $ = cheerio.load(data, { xmlMode: true });
    const list = $('body article.audible').get();
    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: `https://soundcloud.com/${user}/tracks`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    };
};
