const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getArticles() {
    const url = 'https://cloudnative.to/blog/';
    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const articles = $('div.page-body .stream-item');
    return articles.toArray().map((elem) => {
        const a = $(elem).find('.article-title > a');
        const summary = $(elem).find('.summary-link');
        const meta = $(elem).find('.stream-meta .article-metadata');
        const time = meta.find('.article-date').text().replace('发布于', '');
        return {
            title: a.text(),
            link: a.attr('href'),
            description: summary.text(),
            pubDate: timezone(parseDate(time, 'YYYY-MM-DD'), +8),
            author: meta.find('span').eq(0).find('a').text(),
            category: meta.find('.article-categories a').text(),
        };
    });
}

module.exports = async (ctx) => {
    const articles = await getArticles();
    ctx.state.data = {
        title: '博客 | 云原生社区（中国）',
        link: 'https://cloudnative.to/blog/',
        item: articles,
    };
};
