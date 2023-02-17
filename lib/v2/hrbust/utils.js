const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// const base = 'http://hrbust.edu.cn';
const jwzxBase = 'http://jwzx.hrbust.edu.cn/homepage/';

const columnIdBase = (id) => (id ? `${jwzxBase}infoArticleList.do?columnId=${id}` : `${jwzxBase}infoArticleList.do?columnId=354`);

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const detailPage = (e, cache) =>
    cache.tryGet(e.detailPage, async () => {
        const result = await got(e.detailPage);
        const $ = cheerio.load(result.data);
        const title = $('div#article h2').text().trim();
        const desc =
            $('div.body').html() &&
            $('div.body')
                .html()
                .replace(/style="(.*?)"/g, '')
                .trim();
        const pubDate = timezone(
            parseDate(
                $('div#articleInfo ul li')
                    .first()
                    .text()
                    .replace(/发布日期：/g, '')
                    .trim()
            ),
            +8
        );
        return {
            title: e.title || title,
            description: renderDesc(desc),
            link: e.detailPage,
            pubDate: e.pubDate || pubDate,
        };
    });

const fetchAllArticle = (data, base) => {
    const $ = cheerio.load(data);
    const article = $('.articleList li div');
    const info = article
        .map((i, e) => {
            const c = cheerio.load(e);
            const r = {
                title: c('a').first().text().trim(),
                detailPage: new URL(c('a').attr('href'), base).href,
                pubDate: timezone(parseDate(c('span').first().text().trim()), +8),
            };
            return r;
        })
        .get();
    return info;
};

module.exports = {
    // BASE: base,
    JWZXBASE: jwzxBase,
    columnIdBase,
    fetchAllArticle,
    detailPage,
    renderDesc,
};
