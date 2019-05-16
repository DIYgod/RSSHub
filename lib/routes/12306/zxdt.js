const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const id = ctx.params.id || -1;

    let link;
    if (id === -1) {
        link = 'https://www.12306.cn/mormhweb/zxdt/index_zxdt.html';
    } else {
        link = `https://www.12306.cn/mormhweb/1/${id}/index_fl.html`;
    }

    const response = await axios.get(link);
    const data = response.data;
    const $ = cheerio.load(data);
    const name = $('div.nav_center > a:nth-child(4)').text();

    const list = $('#newList > ul > li')
        .map(function() {
            const info = {
                title: $(this)
                    .find('a')
                    .text(),
                link: $(this)
                    .find('a')
                    .attr('href'),
                date: $(this)
                    .find('span')
                    .text()
                    .slice(1, -1),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(link, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);
            let description = $('.article-box').html();
            if (description) {
                description = description.replace(/src="/g, `src="${url.resolve(itemUrl, '.')}`).trim();
            } else {
                description = $('.content_text')
                    .html()
                    .trim();
            }

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${name}最新动态`,
        link: link,
        item: out,
    };
};
