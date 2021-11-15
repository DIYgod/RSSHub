import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const baseUrl = 'http://news.hfut.edu.cn/tzgg.htm';

    const {
        data
    } = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(data);
    ctx.state.data = {
        link: baseUrl,
        title: $('title').text(),
        item: $('body > div.list.wrap > div > ul > li')
            .slice(0, 10)
            .map((_, elem) => ({
                title: $('a', elem).attr('title'),
                link: $('a', elem).attr('href'),
                pubDate: new Date($('a > i', elem).text().replace('年', '-').replace('月', '-').replace('日', '')),
            }))
            .get(),
    };
};
