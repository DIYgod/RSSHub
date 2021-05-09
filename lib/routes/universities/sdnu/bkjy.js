const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'zhxw':
            title = '综合新闻';
            path = 'zhxw.htm';
            break;
        case 'tzgg':
            title = '通知公告';
            path = 'tzgg.htm';
            break;
        case 'jszq':
            title = '教师专区';
            path = 'jszq.htm';
            break;
        case 'xszq':
            title = '学生专区';
            path = 'xszq.htm';
            break;
    }

    const response = await got({
        method: 'get',
        url: 'http://www.bkjy.sdnu.edu.cn/index/' + path,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.section-notice li').slice(0, 19);

    ctx.state.data = {
        title: '山东师范大学教务处- ' + title,
        link: 'http://www.bkjy.sdnu.edu.cn/index/' + path,
        description: '山东师范大学教务处 - ' + title,
        language: 'Chinese',
        allowEmpty: true,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('li a').text(),
                        link: item.find('li a').attr('href'),
                        description: item.find('li a').text(),
                    };
                })
                .get(),
    };
};
