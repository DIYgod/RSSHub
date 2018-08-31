const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://jwc.njupt.edu.cn';

const map = {
    notice: '/1594',
    news: '/1596',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'notice';
    const link = host + map[type] + '/list.htm';
    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('.content')
        .find('a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            itemUrl = url.resolve(host, itemUrl);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: $('.Article_Title').text(),
                link: itemUrl,
                description: $('.wp_articlecontent')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim(),
                pubDate: new Date(
                    $('.Article_PublishDate')
                        .text()
                        .replace('发布时间：', '')
                ),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );
    let info = '通知公告';
    if (type === 'news') {
        info = '教务快讯';
    }
    ctx.state.data = {
        title: '南京邮电大学 -- ' + info,
        link,
        item: out,
    };
};
