const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.cce.fudan.edu.cn';
const link = 'http://www.cce.fudan.edu.cn/14096/list.htm';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);

    const urlList = $('.Article_Title a')
        .get()
        .map((i) => host + $(i).attr('href'));

    const out = await Promise.all(
        urlList.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const targetDate = $('.arti_update')
                .text()
                .match(/(\d{4}-\d{2})-\d{2}/);

            if (targetDate) {
                const single = {
                    title: $('.arti_title').text(),
                    link: itemUrl,
                    description: $('.wp_articlecontent').html(),
                    pubDate: targetDate[0],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            }
        })
    );

    ctx.state.data = {
        title: '复旦大学继续教育学院 - 通知公告',
        link,
        item: out.filter((i) => i),
    };
};
