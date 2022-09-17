const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.science.org';

const fetchDesc = (list, browser, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });

                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('section#frontmatter, .news-article-content, .news-article-content--featured');
                const res = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();

                const $ = cheerio.load(res);
                const abstract = $('div#abstracts').html();
                const content = $('.news-article-content--featured').length
                    ? $('.news-article-content--featured').html()
                    : $('.news-article-content').length
                    ? $('.news-article-content').html()
                    : $('.info-panel__formats a.btn__request-access').length
                    ? ''
                    : $('section#bodymatter').html();

                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    abs: abstract,
                    content,
                });

                return item;
            })
        )
    );

const getItem = (item, $) => {
    item = $(item);
    return {
        title: item.find('.article-title a').attr('title'),
        link: `${baseUrl}${item.find('.article-title a').attr('href')}`,
        doi: item.find('.article-title a').attr('href').replace('/doi/', ''),
        pubDate: parseDate(item.find('.card-meta__item time').text()),
        author: item
            .find('.card-meta ul[title="list of authors"] li')
            .toArray()
            .map((author) => $(author).text())
            .join(', '),
    };
};

module.exports = {
    baseUrl,
    fetchDesc,
    getItem,
};
