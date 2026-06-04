import workerFactory from './utils';

export default workerFactory(
    (ctx) => {
        const config = {
            news: {
                link: 'xsb/list/2938-1-20.htm',
                title: '新闻发布',
            },
            scholarship: {
                link: 'xsb/list/611-1-20.htm',
                title: '奖学金',
            },
            activity: {
                link: 'xsb/list/2676-1-20.htm',
                title: '党团活动',
            },
            lecture: {
                link: 'xsb/list/1981-1-20.htm',
                title: '讲座活动',
            },
            all: {
                link: 'xsb/list/705-1-20.htm',
                title: '信息通告',
            },
            financialAid: {
                link: 'xsb/list/1001-1-20.htm',
                title: '助学金',
            },
            zhcp: {
                link: 'xsb/list/3016-1-20.htm',
                title: '本科生综合测评',
            },
        };

        const type = ctx.req.param('type') || 'all';

        return {
            title: '上海交通大学电子信息与电气工程学院学生办 -- ' + config[type].title,
            local: config[type].link,
            author: '上海交通大学电子信息与电气工程学院学生工作办公室',
        };
    },
    ($) =>
        $('.list_box_5_2 li')
            .toArray()
            .map((e) => ({
                date: $(e).children('span').text().slice(1, -1),
                title: $(e).children('a').text().slice(1),
                link: $(e).children('a').attr('href'),
            }))
);
