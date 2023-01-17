const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const base = 'http://tfbd.ccf.org.cn';

const urlBase = (caty, id) => base + `/tfbd/${caty}/${id}/`;

const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const detailPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const result = await got(link);
        const $ = cheerio.load(result.data);
        const description = $('div.articleCon').html();

        return {
            description,
        };
    });

const fetchAllArticles = (data) => {
    const $ = cheerio.load(data);
    const articles = $('div.file-list div.article-item');
    const info = articles
        .map((i, e) => {
            const c = $(e);
            const r = {
                title: c.find('h3 a[href]').text().trim(),
                link: base + c.find('h3 a[href]').attr('href'),
                pubDate: timezone(parseDate(c.find('p').text().trim(), 'YYYY-MM-DD'), +8),
            };
            return r;
        })
        .get();

    return info;
};

module.exports = {
    BASE: base,
    urlBase,
    fetchAllArticles,
    detailPage,
    renderDesc,
    renderAuthor,
};
