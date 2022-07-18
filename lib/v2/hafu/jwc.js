const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'https://jwc.hafu.edu.cn/tzgg.htm';

const host = 'https://jwc.hafu.edu.cn';

module.exports = async (ctx) => {
    const title = '河南财院-教务处公告通知';
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('table[class="winstyle259713"] tbody tr');
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
