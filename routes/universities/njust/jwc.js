const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'http://jwc.njust.edu.cn/1216/list.htm',
        headers: {
            Referer: 'https://jwc.njust.edu.cn',
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('tr','table#newslist');

    ctx.state.data = {
        title: $('title')
            .first()
            .text(),
        link: `http://jwc.njust.edu.cn/1216/list.htm`,
        description: '南京理工大学教务处 - 教师通知',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        pubDate: new Date(item.find('.time').text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
