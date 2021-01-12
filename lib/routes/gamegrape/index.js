const got = require('@/utils/got');
const cheerio = require('cheerio');
const BASE_URL = 'http://youxiputao.com';
function getNum(str) {
    const result = str.match(/(\d{1,2}).*/);
    if (result) {
        return parseInt(result[1]);
    }
}
function resolveRelativeTime(relativeTime) {
    const result = /\S* · (\d{1,2}天)?(\d{1,2}小时)?(\d{1,2}分钟)?/.exec(relativeTime);
    let day, hour, min;
    if (result[1]) {
        day = getNum(result[1]);
    }
    if (result[2]) {
        hour = getNum(result[2]);
    }
    if (result[3]) {
        min = getNum(result[3]);
    }
    return (((day || 0) * 24 + (hour || 0)) * 60 + (min || 0)) * 60 * 1000;
}
module.exports = async (ctx) => {
    const { id } = ctx.params;
    const feed_url = `${BASE_URL}/article/${id ? `index/id/${id}` : ''}`;
    const resp = await got({ url: feed_url });
    const { data } = resp;
    const $ = cheerio.load(data);
    const feed_title = $('title').text();
    const list = $('.news-info-box')
        .map((_, item) => {
            item = $(item);
            const txt_author_pubDate = $(item.find('div > p > span')[1]).text();
            return {
                title: item.parent().find('h4').text(),
                link: BASE_URL + item.find('a.cover').attr('href'),
                author: `${txt_author_pubDate}`.replace(/ · \S*$/, ''),
                description: $(item.find('div > p')[0]).text(),
                pubDate: Date.now() - resolveRelativeTime(txt_author_pubDate),
            };
        })
        .get();
    ctx.state.data = {
        title: feed_title,
        link: feed_url,
        item: list,
    };
};
