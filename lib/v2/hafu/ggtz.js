const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'https://www.hafu.edu.cn/index/ggtz.htm';

const host = 'https://www.hafu.edu.cn/index/';

module.exports = async (ctx) => {
    const title = '河南财院-公告通知';
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('div[class="xxjj-left"] div ul li');
    const items = await Promise.all(
        list.map((_, item) => {
            const pageUrl = host + $(item).find('a').attr('href');

            return {
                title: $(item).find('a').text(),
                link: pageUrl,
                pubDate: $(item).find('span').text(),
            };
        })
    );

    ctx.state.data = {
        title,
        url,
        item: items,
    };
};
