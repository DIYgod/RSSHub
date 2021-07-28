const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://xsc.dgut.edu.cn/';
    const name = '学生工作部（学生处）';
    const type = ctx.params.type;
    let info, url_type;
    switch (type) {
        case '1':
            info = '学工动态';
            url_type = 'bgfw/xgdt';
            break;
        case '2':
            info = '通知公告';
            url_type = 'bgfw/tzgg';
            break;
        case '4':
            info = '网上公示';
            url_type = 'bgfw/wsgs';
            break;
        default:
            info = '通知公告';
            url_type = 'bgfw/tzgg';
    }

    const response = await got({
        method: 'get',
        url: host + url_type + '/',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('#paging > ul').find('li').slice(0, 10);

    ctx.state.data = {
        title: `东莞理工学院 ${name} ${info}`,
        link: host + url_type + '/index.shtml',
        description: `东莞理工学院 ${name} ${info}`,
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.find('a').text(),
                        pubDate: item.find('.time').text(),
                        link: host + item.find('a').attr('href').slice(1),
                    };
                })
                .get(),
    };
};
