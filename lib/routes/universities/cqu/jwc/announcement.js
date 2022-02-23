const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.path || 'index/tzgg';
    const baseUrl = `http://jwc.cqu.edu.cn/${category.replace(/[^/]*$/, '')}`;
    const url = `http://jwc.cqu.edu.cn/${category}.htm`;
    const response = await got({
        method: 'get',
        url,
    });
    const { parseDate } = require('@/utils/parse-date');
    const $ = cheerio.load(response.data);
    const links = $('li.pot-r', 'div.page-contner.fl')
        .map((index, item) => {
            item = $(item);
            const a = item.find('a.no-wrap')[0];
            return {
                date: parseDate(item.find('span.fr').text(), 'YYYY-MM-DD'),
                title: a.attribs.title,
                link: baseUrl + a.attribs.href,
            };
        })
        .get();
    const items = await Promise.all(
        links.map(async ({ date, title, link }) => {
            const item = {
                title,
                link,
                pubDate: date,
            };
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }
            const response = await got({
                method: 'get',
                url: link,
            });

            const content = cheerio.load(response.data)('div#vsb_content', 'form[name=_newscontent_fromname]');
            item.description = content.find('div.v_news_content').html();
            ctx.cache.set(item.link, item);
            return item;
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $.title,
        item: items.filter((x) => x),
    };
};
