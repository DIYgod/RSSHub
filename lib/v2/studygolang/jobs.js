const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const base_url = 'https://studygolang.com';

module.exports = async (ctx) => {
    const jobs_url = 'https://studygolang.com/go/jobs';

    const response = await got({
        url: jobs_url,
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.topics .topic').get();

    ctx.state.data = {
        title: 'Go语言中文网 | 招聘',
        link: jobs_url,
        description: `获取Go语言中文网的最新招聘`,
        item: await Promise.all(list.map((item) => getFeedItem(item))),
    };
};

function getFeedItem(item) {
    const $ = cheerio.load(item);
    const title = $('.title a');

    return {
        title: title.attr('title'),
        link: `${base_url}${title.attr('href')}`,
        pubDate: timezone(parseDate($('.meta .timeago').attr('title'), 'YYYY-MM-DD hh:mm:ss'), +8),
    };
}
