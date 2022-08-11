const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const siteLink = 'http://www.chinacef.cn';

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const cleanDom = (dom) => {
    dom('*[style]').removeAttr('style');
    dom('br').remove();
    dom('span:empty').remove();
    dom('p:empty').remove();
    dom('p').each((_, el) => {
        if (dom(el).html().trim() === '') {
            dom(el).remove();
        }
    });
    return dom;
};

const getArticleDetail = async (link) => {
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cleanDom(cheerio.load(response.data));

    const title = $('span[class=contenttitle]').first().text().trim();
    const author = $('a[rel=author]').first().text().trim();
    const time = parseDate($('.divwidth').text().trim().split(' ')[3], 'YYYY-MM-DD');
    const description = $('div[class=newsmaintext]').html();
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
