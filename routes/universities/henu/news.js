const axios = require('../../../utils/axios');
const cheerio = require('cheerio'); 
 
const host = 'http://jwc.henu.edu.cn';

const getnewlist = ($) => {
    const items = $('.list td');
    return {
        title: $('tit1').text(),
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
 
const MAP = {
    // 学生专栏
    news: {
        path: 'xszl',
        func: getnewlist,
    },
    // 教师专栏
    media: {
        path: 'jszl',
        func: getnewlist,
    },
    // 新闻公告
    notice: {
        path: 'xwgg',
        func: getnewlist,
    },
    // 院部动态
    jobs: {
        path: 'ybdt',
        func: getnewlist,
    },
    // 高教前沿
    workday: {
        path: 'gjqy',
        func: getnewlist,
    },
};

module.exports = async (ctx) => {
    let type = ctx.params && ctx.params.type;

    if (!(type in MAP)) {
        type = 'notice';
    }

    const response = await axios({
        method: 'get',
        url: `${host}/jwzl/${MAP[type].path}`,
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);
    ctx.state.data = MAP[type].func($);
};
