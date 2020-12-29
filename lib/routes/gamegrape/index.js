const got = require('@/utils/got');
const cheerio = require('cheerio');
const BASE_URL = 'http://youxiputao.com';

function resolveRelativeTime(relativeTime) {
    const reg = /\S* · (\d{1,2}天)?(\d{1,2}小时)?(\d{1,2}分钟)?/;
    const result = reg.exec(relativeTime);
    let day, hour, min;

    if (result[0]) {
        day = result[0];
    }
    if (result[1]) {
        hour = result[1];
    }
    if (result[2]) {
        min = result[2];
    }

    return (((day || 0) * 24 + (hour || 0)) * 60 + (min || 0)) * 60 * 1000;
}
module.exports = async (ctx) => {
    const { id } = ctx.params;
    const feed_url = `${BASE_URL}/article/${id ? `index/id/${id}` : ''}`;
    const resp = await got({
        method: 'get',
        url: feed_url,
    });
    const { data } = resp;
    const $ = cheerio.load(data);
    const list = $('.news-info-box')
        .map((_, item) => {
            item = $(item);
            const txt_author_pubDate = $(item.find('div > p > span')[1]).text();
            const author = `${txt_author_pubDate}`.replace(/ · \S*$/, '');
            const link = BASE_URL + item.find('a.cover').attr('href');
            const title = item.parent().find('h4').text();
            const description = $(item.find('div > p')[0]).text();
            const pubDate = Date.now() - resolveRelativeTime(txt_author_pubDate);
            return {
                title,
                link,
                author,
                description,
                pubDate,
            };
        })
        .get();
    const feed_title = $('title').text();

    ctx.state.data = {
        title: feed_title,
        link: feed_url,
        item: list,
    };
};
