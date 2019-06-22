const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.wzbc.edu.cn';

const parserAbb = ($) => {
    const items = $('.newslist li').slice(0, 10);
    return {
        title: $('title').text(),
        item:
            items &&
            items
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.text(),
                        link: `${host}${item.find('a').attr('href')}`,
                        description: item.text(),
                        pubDate: item.find('span').text(),
                    };
                })
                .get(),
    };
};

const parserFull = ($) => {
    const items = $('.picnewlist li').slice(0, 10);
    return {
        title: $('title').text(),
        item:
            items &&
            items
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        link: `${host}${item.find('a').attr('href')}`,
                        description: item.find('p').text(),
                        pubDate: item.find('.time').text(),
                    };
                })
                .get(),
    };
};

const MAP = {
    // 校园新闻
    news: {
        path: 'Col80',
        func: parserFull,
    },
    // 媒体商院
    media: {
        path: 'Col98',
        func: parserFull,
    },
    // 通知公告
    notice: {
        path: 'Col13',
        func: parserAbb,
    },
    // 人才招聘
    jobs: {
        path: 'Col14',
        func: parserAbb,
    },
    // 行事历
    workday: {
        path: 'Col282',
        func: parserAbb,
    },
    // 招标公告
    tender: {
        path: 'Col541',
        func: parserAbb,
    },
    // 学术动态
    activity: {
        path: 'Col16',
        func: parserAbb,
    },
};

module.exports = async (ctx) => {
    let type = ctx.params && ctx.params.type;

    if (!(type in MAP)) {
        type = 'notice';
    }

    const response = await got({
        method: 'get',
        url: `${host}/Col/${MAP[type].path}/Index.aspx`,
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);
    ctx.state.data = MAP[type].func($);
};
