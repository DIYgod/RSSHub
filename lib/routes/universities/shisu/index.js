const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://news.shisu.edu.cn';

const config = {
    news: {
        link: 'http://news.shisu.edu.cn',
        title: '新闻',
    },
    research: {
        link: 'http://news.shisu.edu.cn/gazette',
        title: '学术',
    },
    notice: {
        link: 'http://news.shisu.edu.cn/notice/',
        title: '公告',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type ? ctx.params.type : 'news';
    const link = type === 'news' ? config.news.link : type === 'research' ? config.research.link : config.notice.link;
    const title = type === 'news' ? config.news.title : type === 'research' ? config.research.title : config.notice.title;
    const respond = await got.get(link);
    const $ = cheerio.load(respond.data);
    const list = $('.list-con')
        .find('li')
        .slice(0, 10)
        .map(function (index, ele) {
            return {
                title: $(ele).find('.list-txt-1').text(),
                link: $(ele).find('a').attr('href'),
                date: $(ele).find('.list-date').text(),
            };
        })
        .get();

    const all = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(host, item.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            let desc = '';
            const respond = await got.get(itemUrl);
            const $ = cheerio.load(respond.data);
            if (type === 'notice') {
                desc = $('.content-con').text();
            } else {
                desc = $('#vsb_content_2').text();
                if (desc.length > 256) {
                    desc = desc.slice(0, 256) + '...';
                }
            }
            const date = new Date(item.date);
            const time_zone = 8;
            const server_offset = date.getTimezoneOffset() / 60;
            const single = {
                title: item.title,
                link: itemUrl,
                pubDate: new Date(date.getTime() - 60 * 60 * 1000 * (time_zone + server_offset)).toUTCString(),
                description: desc || item.title,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: title + ' - 上外新闻',
        link: 'http://news.shisu.edu.cn/',
        item: all,
    };
};