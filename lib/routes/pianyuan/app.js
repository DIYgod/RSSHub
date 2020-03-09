const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const media = ctx.params.media || -1;
    const link_base = 'http://pianyuan.la/';
    let description = '电影和剧集';
    let link = link_base;
    if (media !== -1) {
        link = link_base + `?cat=${media}`;
        if (media === 'mv') {
            description = '电影';
        } else if (media === 'tv') {
            description = '剧集';
        } else {
            link = link_base;
        }
    }

    const response = await got.get(link);
    const data = response.data;
    const $ = cheerio.load(data);

    const items = [];
    $('#main-container > div > div.col-md-10 > table > tbody > tr').each(function(i, item) {
        const link = $(item)
            .find('td.dt.prel.nobr > a')
            .attr('href');
        const text = $(item)
            .find('td.dt.prel.nobr > a')
            .text();
        const description = $(item)
            .find('td.dt.prel.nobr')
            .text()
            .replace(/^\s+|\s+$/g, '');
        const size = $(item)
            .find('td:nth-child(2)')
            .text();

        const description_simple = description.substr(0, description.indexOf('主演')).replace(text, '');

        items.push({
            title: `[${size}] ${description_simple}`,
            description: `${description}`,
            link: link_base + link,
        });
    });

    ctx.state.data = {
        title: `片源网`,
        description: description,
        link: link_base,
        item: items,
    };
};
