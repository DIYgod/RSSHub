import got from '~/utils/got.js';
import cheerio from 'cheerio';
import util from './utils.js';

export default async (ctx) => {
    const {
        type
    } = ctx.params;
    let url = '';
    if (type) {
        url = `http://www.gs.sjtu.edu.cn/index/tzgg/${type}.htm`;
    } else {
        url = 'http://www.gs.sjtu.edu.cn/index/tzgg.htm';
    }

    const {
        data
    } = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(data);
    const list = $('.comm li').slice(0, 10).get();

    const result = await util.ProcessFeed(list, ctx.cache, url);

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: result,
    };
};
