const got = require('@/utils/got');
const cheerio = require('cheerio');

// 获取通知详情
async function load_detail(list, cache) {
    return await Promise.all(
        list.map(async (item) => {
            const notice_item = cheerio.load(item);
            const url = notice_item('a').attr('href');
            return await cache.tryGet(url, async () => {
                const detail_response = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: url,
                    },
                });
                const detail = cheerio.load(detail_response.data);
                const date_part = detail('.list-main-content > .list-a-content > .page-date > span')
                    .text()
                    .slice(6, 16)
                    .split('-');
                const date = new Date(date_part[0], date_part[1] - 1, date_part[2]);
                return {
                    title: notice_item('li').attr('title'),
                    description: detail('.list-main-content > .list-a-content > .page-content').html(),
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
        url: url,
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
