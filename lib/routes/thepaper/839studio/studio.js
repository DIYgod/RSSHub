import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'http://projects.thepaper.cn/thepaper-cases/839studio/?lang=zh',
    });

    // 使用 cheerio 加载返回的 HTML
    const $ = cheerio.load(data);
    const list = $('div[class=imgtext]');

    ctx.state.data = {
        title: '澎湃美数课作品集',
        link: 'http://projects.thepaper.cn/thepaper-cases/839studio/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.imgup a').first().text(),
                        description: `描述：${item.find('.imgdown p').text()}`,
                        link: item.find('.imgup a').attr('href'),
                    };
                })
                .get(),
    };
};
