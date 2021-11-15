import got from '~/utils/got.js';
import cheerio from 'cheerio';
import util from './utils.js';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'http://news.zjgsu.edu.cn/18/',
    });
    const $ = cheerio.load(data);
    const list = $('ul.list-1 li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '浙江工商大学新闻网-通知公告',
        link: 'http://news.zjgsu.edu.cn/18/',
        description: '浙江工商大学新闻网-通知公告',
        item: result,
    };
};
