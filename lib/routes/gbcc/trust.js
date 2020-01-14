const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.gbcc.org.uk/educational-grants';
    const response = (await got.get(link)).data;

    const $ = cheerio.load(response);

    const items = $('.entry-anchorLinkId')
        .map((i, e) => {
            const text = $(e).next('.entry-text');
            return {
                title: $(text)
                    .find('h1')
                    .html(),
                link: `${link}#${$(e).children('div')[0].attribs.id}`,
                description: $(text).html(),
                pubDate: new Date().toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '英中协会 - 奖学金',
        description: '英中协会是由英国外交和联邦事务部于 1974 年创立的非政府部门公共机构。',
        link,
        item: items,
    };
};
