import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const host = 'http://lib.hhu.edu.cn';

export default async (ctx) => {
    const {
        data
    } = await got.get(`${host}/news/100/1.html`);
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
        links.slice().map(async ({ pubDate, title, link, description }) => {
            if (link.includes('.html')) {
                const { data } = await got.get(`${host}${link}`);
                const $$ = cheerio.load(data);

                const detailedDescription =
                    $$('div.content') &&
                    $$('div.content')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
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
