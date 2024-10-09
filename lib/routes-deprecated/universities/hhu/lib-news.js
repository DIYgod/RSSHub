const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://lib.hhu.edu.cn';

module.exports = async (ctx) => {
    const response = await got.get(`${host}/news/100/1.html`);

    const data = response.data;
    const $ = cheerio.load(data);

    const links = $('body div.main.clearfix div.main_L div.list.clearfix ul li')
        .map((i, el) => {
            el = $(el);
            return {
                link: el.find('a').attr('href'),
                title: el.find('a').text(),
                pubDate: el.find('.time').text(),
                description: el.find('div.txt').text(),
            };
        })
        .get();

    const item = await Promise.all(
        [...links].map(async ({ pubDate, title, link, description }) => {
            if (link.includes('.html')) {
                const { data } = await got.get(`${host}${link}`);
                const $$ = cheerio.load(data);

                const detailedDescription =
                    $$('div.content') &&
                    $$('div.content')
                        .html()
                        .replaceAll('src="/', `src="${url.resolve(host, '.')}`)
                        .replaceAll('href="/', `href="${url.resolve(host, '.')}`)
                        .trim();

                // something went wrong
                if (!detailedDescription) {
                    return;
                }
                return { pubDate, link, title, description: detailedDescription };
            } else {
                // not a webpage, so return a brief info
                return { pubDate, link, title, description };
            }
        })
    );

    ctx.state.data = {
        link: `${host}/news/100/1.html`,
        title: '河海大学图书馆-新闻动态',
        description: '河海大学图书馆-新闻动态',
        item: item.filter(Boolean),
    };
};
