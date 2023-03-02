const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const siteLink = 'https://chinafactcheck.com';

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const cleanDom = (dom) => {
    dom('*[style]').removeAttr('style');
    dom('br').remove();
    dom('span:empty').remove();
    dom('span').each((_, el) => {
        if (dom(el).html().trim() === '&nbsp;') {
            dom(el).remove();
        }
    });
    dom('p:empty').remove();
    dom('p').each((_, el) => {
        if (dom(el).html().trim() === '') {
            dom(el).remove();
        }
    });
    return dom;
};

const getArticleDetail = async (link) => {
    const response = await got(link);
    const $ = cleanDom(cheerio.load(response.data));

    const title = $('.content-head h2').text().trim();
    const author = $('.content-persons p span:last').text().trim();
    const time = parseDate($('.content-time').text().trim(), 'YYYY-MM-DD');

    const description = {
        article: $('div[class=content-list-box]').html(),
    };
    return new ArticleDetail(title, author, time, renderDesc(description));
};
class ArticleDetail {
    constructor(title, author, time, description) {
        this.title = title;
        this.author = author;
        this.time = time;
        this.description = description;
    }
}

module.exports = {
    siteLink,
    renderDesc,
    cleanDom,
    getArticleDetail,
    ArticleDetail,
};
