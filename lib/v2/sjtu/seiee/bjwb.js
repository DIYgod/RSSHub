const workerFactory = require('./utils');

module.exports = workerFactory(
    (ctx) => {
        const config = {
            abroad: {
                link: 'bkjwb/list/1507-1-20.htm',
                title: '交换交流',
            },
            international: {
                link: 'bkjwb/list/2281-1-20.htm',
                title: '国际办学通知',
            },
            major_select: {
                link: 'bkjwb/list/1503-1-20.htm',
                title: '分专业',
            },
            major_transfer: {
                link: 'bkjwb/list/1505-1-20.htm',
                title: '转专业',
            },
            postgraduate: {
                link: 'bkjwb/list/1506-1-20.htm',
                title: '直升研究生',
            },
        };

        const type = ctx.params.type;

        return {
            title: '上海交通大学电子信息与电气工程学院学生办 -- ' + config[type].title,
            local: config[type].link,
            author: '上海交通大学电子信息与电气工程学院本科教务办',
        };
    },
    ($) =>
        $('.list_box_5 li')
            .toArray()
            .map((e) => ({
                date: $(e).children('span').text().slice(1, -1),
                title: $(e).children('a').text().slice(2),
                link: $(e).children('a').attr('href'),
            }))
);
