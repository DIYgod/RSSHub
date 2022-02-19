const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const type = ctx.params.type;
    const url = `http://www.3dmgame.com/games/${name}/${type}`;

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    let list;
    if (type === 'resource') {
        list = $('.ZQ_Left .Llis_4 .lis:first-of-type li').get();
    } else {
        list = $('.ZQ_Left .lis').slice(0, 10).get();
    }

    const items = list.map((i) => {
        const item = $(i);
        const url = item.find('.bt').attr('href');

        const single = {
            title: item.find('.bt').text(),
            pubDate: item.find('p').text(),
            link: url,
            guid: url,
        };
        return single;
    });

    ctx.state.data = {
        title: $('title').text().split('_')[0],
        link: url,
        item: items,
    };
};
