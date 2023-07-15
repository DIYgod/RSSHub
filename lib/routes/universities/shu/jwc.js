const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://jwb.shu.edu.cn';

const config = {
    notice: {
        link: 'https://jwb.shu.edu.cn/index/tzgg.htm',
        type: 'notice',
        title: '通知通告',
    },
    news: {
        link: 'https://jwb.shu.edu.cn/index/xw.htm',
        type: 'news',
        title: '新闻',
    },
};

module.exports = async (ctx) => {
    let type = ctx.params.type;
    type = type ? type : 'notice';
    const link = type === 'news' ? config.news.link : config.notice.link;
    const title = type === 'news' ? config.news.title : config.notice.title;
    const respond = await got.get(link);
    const $ = cheerio.load(respond.data);
    const list = $('.only-list')
        .find('li')
        .slice(0, 10)
        .map((index, ele) => ({
            title: $(ele).find('a').text(),
            link: $(ele).find('a').attr('href'),
            date: $(ele).children('span').text().replace('年', '.').replace('月', '.').replace('日', ''),
        }))
        .get();

    const all = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(host, item.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const date = new Date(item.date);
            const time_zone = 8;
            const server_offset = date.getTimezoneOffset() / 60;
            const respond = await got.get(itemUrl);
            const $ = cheerio.load(respond.data);
            const single = {
                title: item.title,
                link: itemUrl,
                author: $('[id$=_lblUser]').text().trim(),
                pubDate: new Date(date.getTime() - 60 * 60 * 1000 * (time_zone + server_offset)).toUTCString(),
                guid: itemUrl,
                description: item.title,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: title + ' - 上海大学教务处',
        link: 'http://jwb.shu.edu.cn/',
        item: all,
    };
};
