const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const domain = 'www.fzmtr.com';
    const announcementsUrl = `http://${domain}/html/fzdt/tzgg/index.html`;
    const response = await got(announcementsUrl);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('span#resources li')
        .map((_, item) => {
            item = $(item);
            const url = `http://${domain}` + item.find('a').attr('href');
            const title = item.find('a').text();
            const publishTime = parseDate(item.find('span').text());
            return {
                title,
                link: url,
                author: '福州地铁',
                pubtime: publishTime,
            };
        })
        .get();

    ctx.state.data = {
        title: '福州地铁通知公告',
        url: announcementsUrl,
        description: '福州地铁通知公告',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
};
