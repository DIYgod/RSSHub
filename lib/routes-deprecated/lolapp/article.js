const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');
module.exports = async (ctx) => {
    const uuid = ctx.params.uuid;
    const url = 'https://mlol.qt.qq.com/go/mlol_news/author_feeds?author_uuid=' + uuid;
    const res = await got.get(url).json();
    const data = res.data.feedsInfo;
    const name = data[0].feedNews.footer.source;
    const newData = [];
    let pubDate = [];
    for (let i = 0; i < data.length; i++) {
        newData[i] = data[i].feedNews.body;
        newData[i].link = 'https://mlol.qt.qq.com/go/mlol_news/varcache_article?is_lqt=true&docid=' + newData[i].commentID;
        pubDate[i] = getPublishedDate(newData[i].link);
    }
    pubDate = await Promise.all(pubDate);
    for (let i = 0; i < data.length; i++) {
        newData[i].pubDate = pubDate[i];
    }
    ctx.state.data = {
        title: `${name}的文章`,
        link: String(url),
        description: `${name}的文章`,
        item: newData.map((item) => ({
            title: item.title,
            description: `<img src='${item.imgUrl}'>`,
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};

async function getPublishedDate(url) {
    const res = await got.get(url).text();
    const start = res.indexOf('createdStr') + 15;
    const end = res.indexOf('"', start);
    const date = res.substring(start, end);
    let publishedDate;
    if (date === '刚刚') {
        publishedDate = dayjs();
    } else if (date.indexOf('前') > 0) {
        // XX分钟/小时前
        publishedDate = parseRelativeDate(date);
    } else if (date.indexOf('年') > 0) {
        // YYYY年MM月DD日+MM月DD日 hh:mm
        publishedDate = parseDate(date, ['YYYY年MM月DD日', 'MM月DD日 hh:mm']);
    } else {
        publishedDate = dayjs();
    }
    return publishedDate;
}
