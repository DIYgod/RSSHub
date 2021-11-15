import got from '~/utils/got.js';
import cheerio from 'cheerio';
import util from './utils.js';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://gaoqing.fm/',
        headers: {
            Referer: 'https://gaoqing.fm/',
        },
    });

    const $ = cheerio.load(data);
    const list = $('#result1 > li').get();

    let result = await util.ProcessFeed(list, ctx.cache);
    result = result.slice(0, 10);

    ctx.state.data = {
        title: '高清电台',
        link: 'https://gaoqing.fm',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
