const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://www.hpoi.net';

module.exports = async (ctx) => {
    const { user_id, caty } = ctx.params;

    const url = `${root_url}/user/${user_id}/hobby?order=actionDate&favState=${caty}&view=5&category=100&sortType=2`;
    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('#content > div.action-box div.action-detail')
        .map((_, item) => {
            item = $(item);
            const img = item.find('div.list-5-left > a > img').attr('src');
            const a = item.find('div.list-5-right > a.action-title');
            return {
                title: a.text(),
                link: 'https://www.hpoi.net/' + a.attr('href'),
                description: `<img src="${img}"><br>制作：${item.find('.badge').eq(0).text()}<br>发售：${item.find('.badge').eq(1).text()}`,
            };
        })
        .get();

    const title = $('div.col-md-15.col-sm-15 > div:nth-child(2)').text() + $('.navbar-nav .active').eq(0).text() + '的手办';

    ctx.state.data = {
        title,
        link: url,
        item: list,
        allowEmpty: true,
    };
};
