const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const sanitizeHtml = require('sanitize-html');

module.exports = async (ctx) => {
    const indexLink = 'https://awesome.fairyever.com/daily/';
    const { data } = await axios.get(indexLink);

    const $ = cheerio.load(data);
    // 修改 slice 可以获取更多天的内容，暂时最新的一天就够了
    const days = $('ul.menu-list>li>a')
        .slice(0, 1)
        .toArray();

    const promises = days.map(async (ele) => {
        ele = $(ele);
        const relativePath = ele.attr('href');
        const innerText = ele.text();
        const link = url.resolve(indexLink, relativePath);
        const cache = await ctx.cache.get(link);
        if (cache) {
            return cache;
        }
        const { data } = await axios.get(link);
        const $$ = cheerio.load(data);
        let description = $$('article[title*=日报]>section')
            // 去掉文章头部的 logo 和文章尾部的二维码
            .slice(1, -1)
            .toArray()
            .reduce((pre, cur) => pre + $$.html(cur), '');
        description = sanitizeHtml(description, {
            allowedTags: ['section', 'h2', 'ul', 'li', 'p', 'span', 'a'],
        });
        const item = {
            title: $('head>title').text(),
            pubDate: new Date(innerText.trim()).toUTCString(),
            description,
            guid: link,
            link,
        };
        await ctx.cache.set(link, cache, 24 * 60 * 60);
        return item;
    });

    ctx.state.data = {
        title: '日报 | D2 资源库',
        link: 'https://awesome.fairyever.com/daily/',
        description: '日报 | D2 资源库',
        item: await Promise.all(promises),
    };
};
