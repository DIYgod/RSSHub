const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const section = ctx.params.section ?? 'zxzp';
    const domain = 'iolaw.cssn.cn';
    const response = await got(`http://${domain}/${section}/`);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.notice_right ul li')
        .map((_, item) => {
            item = $(item);
            const url = `http://${domain}` + item.find('a').attr('href').substr(1);
            const title = item.find('a div.title').text();
            const publish_time = parseDate(item.find('a p').text());
            return {
                title,
                link: url,
                author: '中国法学网',
                pubtime: publish_time,
            };
        })
        .get();

    ctx.state.data = {
        title: '中国法学网',
        url: `http://${domain}/${section}/`,
        description: '中国法学网',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
};
