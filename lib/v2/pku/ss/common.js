const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.ss.pku.edu.cn';

const getSingleRecord = async (url) => {
    const res = await got(url);

    const $ = cheerio.load(res.data);
    const list = $('#info-list-ul').find('li');

    return list.toArray().map((item) => {
        item = $(item);
        const date = item.find('.time').text();
        return {
            title: item.find('a').attr('title'),
            pubDate: parseDate(date),
            link: baseUrl + item.find('a').attr('href'),
        };
    });
};

const getArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link);
        const $ = cheerio.load(response.data);

        item.description = $('.article-content').html();
        return item;
    });

module.exports = {
    baseUrl,
    getSingleRecord,
    getArticle,
};
