const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base_host = 'http://jwc.dgut.edu.cn/';
    const host = base_host + 'dglgjwc/';
    const name = '教务处';
    const type = ctx.params.type;
    let info, url_type;
    switch (type) {
        case '1':
            info = '教务公告';
            url_type = 'jwgg';
            break;
        case '2':
            info = '教学信息';
            url_type = 'jxxx';
            break;
        default:
            info = '教学信息';
            url_type = 'jxxx';
    }

    const response = await got({
        method: 'get',
        url: host + url_type + '/list.shtml',
        headers: {
            Referer: base_host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('div.con-right').find('div.list_div').slice(0, 10);

    ctx.state.data = {
        title: `东莞理工学院 ${name} ${info}`,
        link: host + url_type + '/list.shtml',
        description: `东莞理工学院 ${name} ${info}`,
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: item.find('a').text(),
                        category: item.find('.column-name').text(),
                        pubDate: $('td[align="left"]', item).slice(5).text().trim(),
                        link: host + item.find('a').attr('href').slice(1),
                    };
                })
                .get(),
    };
};
