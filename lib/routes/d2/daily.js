const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const sanitizeHtml = require('sanitize-html');

module.exports = async (ctx) => {
    const indexLink = 'https://daily.fairyever.com/';
    const { data } = await axios.get(indexLink);

    const $ = cheerio.load(data);
    // 修改 slice 可以获取更多天的内容，暂时最新的一天就够了
    const days = $('.sidebar-link:contains(年)')
        .slice(0, 1)
        .toArray();

    const promises = days.map(async (ele) => {
        ele = $(ele);
        const relativePath = ele.attr('href');
        const innerText = ele
            .text()
            .replace(/\s+/g, '')
            .replace(/年/g, '-')
            .replace(/月/g, '-')
            .replace(/日/g, '');
        const link = url.resolve(indexLink, relativePath);
        const cache = await ctx.cache.get(link);
        if (cache) {
            return cache;
        }
        const { data } = await axios.get(link);
        const $$ = cheerio.load(data);
        // 去除锚点
        $$('a')
            .filter(function() {
                return $(this).text() === '#';
            })
            .remove();
        let description = $$('.content')
            .toArray()
            .reduce((pre, cur) => pre + $$.html(cur), '');
        description = sanitizeHtml(description, {
            allowedTags: ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'p', 'span', 'a', 'blockquote'],
        });
        const item = {
            title: ele.text() + ' | D2 日报',
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
