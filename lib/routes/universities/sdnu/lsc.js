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
        case 'xsdt':
            title = '学术动态';
            path = 'xsdt.htm';
            break;
        case 'ggtz':
            title = '公告通知';
            path = 'ggtz.htm';
            break;
        case 'xsbg':
            title = '学术报告';
            path = 'xsbg.htm';
            break;
        case 'spzz':
            title = '视频在线';
            path = 'spzz.htm';
            break;
    }

    const response = await got({
        method: 'get',
        url: 'http://www.lsc.sdnu.edu.cn/index/' + path,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.section-notice li').slice(0, 19);

    ctx.state.data = {
        title: '山东师范大学生命科学学院 - ' + title,
        link: 'http://www.lsc.sdnu.edu.cn/index/' + path,
        description: '山东师范大学生命科学学院 - ' + title,
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
