const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.jwc.shu.edu.cn';

const config = {
    notice: {
        link: 'http://www.jwc.shu.edu.cn/index/tzgg.htm',
        type: 'notice',
        title: '通知通告',
    },
    news: {
        link: 'http://www.jwc.shu.edu.cn/index/xw.htm',
        type: 'news',
        title: '新闻',
    },
};

module.exports = async (ctx) => {
    let type = ctx.params.type;
    type = type ? type : 'notice';
    const link = type === 'news' ? config.news.link : config.notice.link;
    const title = type === 'news' ? config.news.title : config.notice.title;
    const respond = await axios.get(link);
    const $ = cheerio.load(respond.data);
    const list = $('#dnn_ctr43516_ArticleList__ctl0_ArtDataList__ctl1_titleLink1')
        .slice(0, 10)
        .map(function(index, ele) {
            return {
                title: $(ele).attr('title'),
                link: $(ele).attr('href'),
                date: $('#dnn_ctr43465_ArtDetail_lblDatePosted').text(),
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
            const respond = await axios.get(itemUrl);
            const $ = cheerio.load(respond.data);
            const single = {
                title: item.title,
                link: itemUrl,
                author: $('.normal')
                    .next()
                    .text()
                    .trim()
                    .slice(0, -3),
                guid: itemUrl,
                pubDate: new Date(
                    new Date(
                        ...$('.normal')
                            .text()
                            .slice(0, 10)
                            .split('-')
                    ).getTime() -
                        60 * 60 * 24 * 30 * 1000
                ).toUTCString(),
                description: item.title,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '上海大学教务处--' + title,
        link: 'http://www.jwc.shu.edu.cn/index.htm',
        item: all,
    };
};
