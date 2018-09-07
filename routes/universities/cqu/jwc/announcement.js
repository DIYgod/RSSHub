const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');

const baseUrl = 'http://jwc.cqu.edu.cn';

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://jwc.cqu.edu.cn/announcement',
        headers: {
            Referer: 'http://jwc.cqu.edu.cn/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const links = $('.views-row a')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: baseUrl + item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        [...links].map(async ({ title, link }) => {
            const response = await axios({
                method: 'get',
                url: link,
            });
            const data = response.data;
            const $ = cheerio.load(data);
            const author = $('.username').text();
            const pubDate = $('time').attr('datetime');
            const description =
                $('div .field-items').html() &&
                $('div .field-items')
                    .find('p')
                    .text();
            return Promise.resolve({ title, author, pubDate, description, link });
        })
    );
    ctx.state.data = {
        title: '重庆大学教务处通知公告',
        link: 'http://jwc.cqu.edu.cn/announcement',
        item: items.filter((x) => x),
    };
};
