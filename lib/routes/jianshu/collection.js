import got from '~/utils/got.js';
import cheerio from 'cheerio';
import util from './utils.js';

export default async (ctx) => {
    const {
        id
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: `https://www.jianshu.com/c/${id}`,
        headers: {
            Referer: `https://www.jianshu.com/c/${id}`,
        },
    });

    const $ = cheerio.load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.jianshu.com/c/${id}`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    };
};
