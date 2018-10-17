const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseURL = 'http://jwc.njust.edu.cn';
    const res = await axios({
        method: 'get',
        url: 'http://jwc.njust.edu.cn/1216/list.htm',
        headers: {
            Referer: 'https://jwc.njust.edu.cn',
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('tr', 'table#newslist');

    ctx.state.data = {
        title: '南京理工大学教务处',
        link: 'http://jwc.njust.edu.cn/1216/list.htm',
        description: '教师通知',

        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: item.find('a').text(),
                        link: `${baseURL + $(item.find('a')).attr('href')}`,
                        pubDate: new Date(item.find('td[width="14%"]').text()).toUTCString(),
                    };
                })
                .get(),
    };
};
