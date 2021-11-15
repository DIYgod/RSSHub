import got from '~/utils/got.js';
import cheerio from 'cheerio';
import util from './utils.js';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://www.jianshu.com',
        headers: {
            Referer: 'https://www.jianshu.com',
        },
    });

    const $ = cheerio.load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '简书首页',
        link: 'https://www.jianshu.com',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
