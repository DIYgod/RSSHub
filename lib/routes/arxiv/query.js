const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `http://export.arxiv.org/api/query?${ctx.params.query}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('entry')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('title').text(),
                link: item.find('link[type="text/html"]').attr('href'),
                pubDate: new Date(item.find('published').text()).toUTCString(),
                description: item.find('summary').text(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'arXiv (' + ctx.params.query + ')',
        link: currentUrl,
        item: list,
    };
};
