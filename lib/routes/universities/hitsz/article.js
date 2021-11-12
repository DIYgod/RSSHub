const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://www.hitsz.edu.cn';
    const category = ctx.params.category || 'id-74';

    const response = await got.get(`${host}/article/${category}.html`);
    const $ = cheerio.load(response.data);
    const category_name = $('div.title_page').text().trim();

    const lists = $('.mainside_news ul li')
        .map((_, el) => ({
            title: $('a', el).text().trim(),
            link: `${host}${$('a', el).attr('href')}`,
            pubDate: new Date($('span[class=date]', el).text()).toUTCString(),
        }))
        .get();

    const items = await Promise.all(
        lists.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);
                item.description =
                    $('div.detail').html() &&
                    $('div.detail')
                        .html()
                        .replace(/src="\//g, `src="${new URL('.', host).toString()}"`)
                        .replace(/href="\//g, `href="${new URL('.', host).toString()}"`)
                        .trim();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '哈尔滨工业大学（深圳）-' + category_name,
        link: `${host}/article/${category}.html`,
        description: '哈尔滨工业大学（深圳）-' + category_name,
        item: items,
    };
};
