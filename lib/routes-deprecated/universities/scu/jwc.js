const got = require('@/utils/got');
const cheerio = require('cheerio');
const url_resolve = require('url').resolve;

// 获取通知详情
function load_detail(list, cache) {
    return Promise.all(
        list.map((item) => {
            const notice_item = cheerio.load(item);
            const url = url_resolve('http://jwc.scu.edu.cn', notice_item('a').attr('href'));
            return cache.tryGet(url, async () => {
                const detail_response = await got({
                    method: 'get',
                    url,
                    headers: {
                        Referer: url,
                    },
                });
                const detail = cheerio.load(detail_response.data);
                const date_part = detail('.page-date > span').text().slice(5, 15).split('-');
                const date = new Date(date_part[0], date_part[1] - 1, date_part[2]);
                return {
                    title: detail('.page-title').text(),
                    description: detail('.page-content').html(),
                    pubDate: date,
                    link: url,
                };
            });
        })
    );
}

module.exports = async (ctx) => {
    const url = 'http://jwc.scu.edu.cn';
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('.list-ll-b > .edit_option >.list-llb-box > .list-llb-s > .list-llb-list').get();
    const detail = await load_detail(list, ctx.cache);
    ctx.state.data = {
        title: '四川大学教务处 - 通知公告',
        link: url,
        item: detail,
    };
};
