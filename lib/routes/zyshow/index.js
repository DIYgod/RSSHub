const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.name = ctx.params.name || 'chongchongchong';

    const rootUrl = `http://www.zyshow.net`;
    const currentUrl = `${rootUrl}/${ctx.params.name}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('#event_detail table tr')
        .slice(1, 30)
        .map((_, tr) => {
            tr = $(tr);
            const link = tr.find('td a');
            return {
                title: link.text(),
                link: `${rootUrl}/${link.attr('href')}`,
                description: tr.text(),
                author: link.text(),
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('title').text()}`,
        link: currentUrl,
        item: list,
    };
};
