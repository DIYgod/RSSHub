const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const base = 'http://www.caai.cn';

const urlBase = (caty) => base + `/index.php?s=/home/article/index/id/${caty}.html`;

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const detailPage = (e, cache) =>
    cache.tryGet(e.link, async () => {
        const result = await got(e.link);
        const $ = cheerio.load(result.data);
        e.description = $('div.article').html();
        return e;
    });

const fetchAllArticles = (data) => {
    const $ = cheerio.load(data);
    const articles = $('div.article-list > ul > li');
    const info = articles.toArray().map((e) => {
        const c = $(e);
        const r = {
            title: c.find('h3 a[href]').text().trim(),
            link: base + c.find('h3 a[href]').attr('href'),
            pubDate: timezone(parseDate(c.find('h4').text().trim(), 'YYYY-MM-DD'), +8),
        };
        return r;
    });
    return info;
};

module.exports = {
    BASE: base,
    urlBase,
    fetchAllArticles,
    detailPage,
    renderDesc,
};
