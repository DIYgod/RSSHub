const got = require('@/utils/got');
const cheerio = require('cheerio');

async function load_detail(list, cache) {
    return await Promise.all(
        list.map(async (item) => {
            const notice_item = cheerio.load(item);
            const url = 'http://xsc.scu.edu.cn' + notice_item('a').attr('href');
            return await cache.tryGet(url, async () => {
                const detail_response = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: 'http://xsc.scu.edu.cn/WEBSITE/XG',
                        Host: 'xsc.scu.edu.cn',
                    },
                });
                const detail = cheerio.load(detail_response.data);
                return {
                    title: notice_item('a').attr('title'),
                    description: detail('.news-content').html(),
                    link: url,
                };
            });
        })
    );
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://xsc.scu.edu.cn/WEBSITE/XG',
        headers: {
            Host: 'xsc.scu.edu.cn',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.news-pannel.notice-news > .news-body > .news-list > ul > li').get();

    const detail = await load_detail(list, ctx.cache);

    ctx.state.data = {
        title: '四川大学学工部 - 通知公告',
        link: 'http://xsc.scu.edu.cn/WEBSITE/XG',
        item: detail,
    };
};
