const got = require('@/utils/got');
const cheerio = require('cheerio');

function load_detail(list, cache) {
    return Promise.all(
        list.map((item) => {
            const notice_item = cheerio.load(item);
            const url = 'http://xsc.scu.edu.cn' + notice_item('a').attr('href');

            const date_part = notice_item('a > span').text().split('-');
            const date = new Date(new Date().getFullYear(), date_part[0] - 1, date_part[1]);
            return cache.tryGet(url, async () => {
                const detail_response = await got({
                    method: 'get',
                    url,
                    headers: {
                        Referer: 'http://xsc.scu.edu.cn/WEBSITE/XG',
                        Host: 'xsc.scu.edu.cn',
                    },
                });
                const detail = cheerio.load(detail_response.data);
                return {
                    title: notice_item('a').attr('title'),
                    description: detail('.news-content').html(),
                    pubDate: date,
                    link: url,
                };
            });
        })
    );
}

module.exports = async (ctx) => {
    const index_response = await got({
        method: 'get',
        url: 'http://xsc.scu.edu.cn/WEBSITE/XG',
        headers: {
            Host: 'xsc.scu.edu.cn',
        },
    });

    const index_data = index_response.data;
    const $_ = cheerio.load(index_data);
    const notice_url = 'http://xsc.scu.edu.cn' + $_('.news-pannel.notice-news > .news-head > a').attr('href');

    const response = await got({
        method: 'get',
        url: notice_url,
        headers: {
            Host: 'xsc.scu.edu.cn',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.news-list > ul > li').get();

    const detail = await load_detail(list, ctx.cache);

    ctx.state.data = {
        title: '四川大学学工部 - 通知公告',
        link: 'http://xsc.scu.edu.cn/WEBSITE/XG',
        item: detail,
    };
};
