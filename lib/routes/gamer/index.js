const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://gnn.gamer.com.tw/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.BH-lbox.GN-lbox2').children().not('.GN-lbox2A').not('.GN-lbox2G');

    const out = await Promise.all(
        list &&
            list
                .map(async (index, item) => {
                    item = $(item);
                    // const prefix_url = 'https:';
                    const link = item.find('a').eq(0).attr('href').replace('//', 'https://');

                    const content = await got({
                        method: 'get',
                        url: link,
                    });
                    const c = cheerio.load(content.data);
                    const description = c('div.GN-lbox3B').children('div').html();

                    return {
                        title: item.find('a').text(),
                        description,
                        link: item.find('a').attr('href'),
                    };
                })
                .get()
    );

    ctx.state.data = {
        title: '巴哈姆特-GNN新闻',
        link: 'https://gnn.gamer.com.tw/',
        item: out,
    };
};
