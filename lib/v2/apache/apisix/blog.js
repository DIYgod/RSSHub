const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getArticles() {
    const url = 'https://apisix.apache.org/zh/blog/';
    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const articles = $('section.sec_gjjg').eq(1).find('article');
    const results = [];
    articles.each((i, elem) => {
        const a = $(elem).find('header > a');
        const time = $(elem).find('footer').find('time').text();
        const author = $(elem).find('footer').find('img').attr('src');
        results.push({
            title: a.find('h2').text(),
            description: a.find('p').text(),
            link: a.attr('href'),
            pubDate: timezone(parseDate(time, 'YYYY年M月D日'), +8),
            author,
        });
    });
    return results;
}

module.exports = async (ctx) => {
    const articles = await getArticles();
    ctx.state.data = {
        title: `Blog | Apache APISIX`,
        link: `https://apisix.apache.org/zh/blog/`,
        item: articles,
    };
};
