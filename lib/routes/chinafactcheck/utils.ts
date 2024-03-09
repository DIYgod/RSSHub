import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

const siteLink = 'https://chinafactcheck.com';

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
    const response = await got(link, {
        headers: {
            'user-agent': config.trueUA,
        },
    });
    const $ = cleanDom(load(response.data));

    const title = $('.content-head h2').text().trim();
    const author = $('.content-persons p span:last').text().trim();
    const pubDate = parseDate($('.content-time').text().trim(), 'YYYY-MM-DD');

    const description = $('div[class=content-list-box]').html();
    const category = $('.content-tags a[rel="tag"]')
        .toArray()
        .map((item) => $(item).text().trim());
    return new ArticleDetail(title, author, pubDate, description, category);
};
class ArticleDetail {
    constructor(title, author, pubDate, description, category) {
        this.title = title;
        this.author = author;
        this.pubDate = pubDate;
        this.description = description;
        this.category = category;
    }
}

export default {
    siteLink,
    cleanDom,
    getArticleDetail,
    ArticleDetail,
    trueUA: config.trueUA,
};
