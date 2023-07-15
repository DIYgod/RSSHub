const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.shu.edu.cn/';

const config = {
    news: {
        link: 'https://www.shu.edu.cn/zhxw.htm',
        title: '综合新闻',
    },
    research: {
        link: 'https://www.shu.edu.cn/kydt1.htm',
        title: '科研动态',
    },
    notice: {
        link: 'https://www.shu.edu.cn/tzgg.htm',
        title: '通知公告',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type ? ctx.params.type : 'news';
    const link = type === 'news' ? config.news.link : type === 'research' ? config.research.link : config.notice.link;
    const title = type === 'news' ? config.news.title : type === 'research' ? config.research.title : config.notice.title;
    const respond = await got.get(link);
    const $ = cheerio.load(respond.data);
    const list = $('.ej_main .list')
        .find('li')
        .slice(0, 5)
        .map((index, ele) => ({
            title: $(ele).find('.bt').text(),
            link: $(ele).find('a').attr('href'),
            date: $(ele).find('.sj').text(),
        }))
        .get();

    const all = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(host, item.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const respond = await got.get(itemUrl);
            const $ = cheerio.load(respond.data);
            let desc = $('.v_news_content').text();
            if (desc.length > 256) {
                desc = desc.slice(0, 253) + '...';
            }
            const date = new Date(item.date);
            const time_zone = 8;
            const server_offset = date.getTimezoneOffset() / 60;
            const single = {
                title: item.title,
                link: itemUrl,
                author: $('.xx>:nth-child(2)').text().trim().slice(3), // 投稿：xxx
                pubDate: new Date(date.getTime() - 60 * 60 * 1000 * (time_zone + server_offset)).toUTCString(),
                description: desc || item.title,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: title + ' - 上海大学',
        link: 'https://www.shu.edu.cn/',
        item: all,
    };
};
