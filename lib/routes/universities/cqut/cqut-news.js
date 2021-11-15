import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://tz.cqut.edu.cn/',
    });
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('#container').find('.record');

    ctx.state.data = {
        title: 'CQUT',
        link: 'https://tz.cqut.edu.cn/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.find('a').attr('title'),
                        link: item.find('a').attr('href'),
                        pubDate: new Date(item.find('.date').text().trim()).toUTCString(),
                    };
                })
                .get(),
    };
};
