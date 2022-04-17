const got = require('@/utils/got');
const cheerio = require('cheerio');

const BLOG_URL = 'https://blog.huangz.me/';

module.exports = async (ctx) => {
    const resp = await got({
        method: 'get',
        url: BLOG_URL,
    });
    const $ = cheerio.load(resp.body);
    const list = $('.toctree-l2');

    const items = await Promise.all(
        list.map((index, item) => {
            const link = `${BLOG_URL}${$(item).find('a').attr('href')}`;

            return ctx.cache.tryGet(link, () => ({
                title: $(item).find('a').text(),
                link,
            }));
        })
    );
    ctx.state.data = {
        title: 'huangz/blog',
        link: 'https://blog.huangz.me',
        item: items,
    };
};
