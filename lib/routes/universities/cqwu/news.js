const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url').resolve;

const host = 'http://www.cqwu.edu.cn';
const map = {
    notify: '/channel_7721.html',
    academiceve: '/channel_7722.html',
};
const titleMap = {
    notify: '通知',
    academiceve: '学术活动',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'academiceve';
    const link = host + map[type];
    const title = '重文理' + titleMap[type] + '公告';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('ul[class="list-unstyled news-uls"]').find('li');
    ctx.state.data = {
        title: title,
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('h4').text(),
                        description: item.find('p').text(),
                        pubDate: new Date(item.find('span[class="pull-right nes-date"]').text()).toUTCString(),
                        link: url(host, item.find('a').attr('href')),
                    };
                })
                .get(),
    };
};
