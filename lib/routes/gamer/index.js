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
                    let element_a;
                    let tag;
                    if (item.attr('class') === 'GN-lbox2F') {
                        element_a = item.find('a').eq(0);
                        tag = item.children('img').eq(0).attr('class');
                    } else {
                        element_a = item.find('a').eq(1);
                        tag = item.children('h1').children('img').eq(0).attr('class');
                    }
                    if (tag === 'IMG-Gmuti') {
                        tag = 'General';
                    } else if (tag === 'IMG-GA19') {
                        tag = 'PC';
                    } else if (tag === 'IMG-GB3') {
                        tag = 'NS';
                    } else if (tag === 'IMG-GB1') {
                        tag = 'PS4';
                    } else if (tag === 'IMG-GA13') {
                        tag = 'ETC';
                    } else if (tag === 'IMG-GAC') {
                        tag = 'AC ';
                    } else if (tag === 'IMG-GA1') {
                        tag = 'OLG';
                    } else if (tag === 'IMG-Gmobi') {
                        tag = 'MOBI';
                    } else if (tag === 'IMG28') {
                        tag = 'FB';
                    } else if (tag === 'IMG-GA17' || tag === 'IMG-Gother') {
                        tag = 'Other';
                    } else {
                        tag = 'Unclassified';
                    }

                    const title = '[' + tag + ']&nbsp;' + element_a.text();
                    const link = element_a.attr('href').replace('//', 'https://');

                    const content = await got({
                        method: 'get',
                        url: link,
                    });
                    const c = cheerio.load(content.data);
                    const description = c('div.GN-lbox3B').children('div').html();

                    return {
                        title,
                        description,
                        link,
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
