const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://jwb.njtech.edu.cn';

const link = host + '/index/tzgg.htm';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);

    const urlList = $('#mainRight li a')
        .get()
        .map((i) => host + $(i).attr('href').replace('..', ''));

    const out = await Promise.all(
        urlList.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const targetDate = $('.time')
                .text()
                .match(/(\d{4}-\d{2})-\d{2}/);

            if (targetDate) {
                const single = {
                    title: $('#mainRight .title').text(),
                    link: itemUrl,
                    description: $('#vsb_content').html(),
                    pubDate: targetDate[0],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            }
        })
    );
    const info = '教务公告';

    ctx.state.data = {
        title: '南京工业大学教务处 - ' + info,
        link,
        item: out.filter((i) => i),
    };
};
