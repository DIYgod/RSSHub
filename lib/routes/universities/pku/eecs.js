const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://eecs.pku.edu.cn/';

    let type = ctx.params && ctx.params.type;
    if (type === undefined) {
        type = '0';
    }

    const response = await got({
        method: 'get',
        url: host + 'Survey/Notice/?Mtitle=' + type,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('.hvr-shutter-out-vertical').slice(0, 10);

    ctx.state.data = {
        title: '北大信科通知',
        link: host + 'Survey/Notice/?Mtitle=' + type,
        description: '北大信科 公告通知',
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('p').text(),
                        link: host + 'Survey/Notice/' + item.attr('href'),
                        description: item.find('p').text(),
                        pubDate: item.find('em').text(),
                    };
                })
                .get(),
    };
};
