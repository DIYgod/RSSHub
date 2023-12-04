const got = require('@/utils/got');
const cheerio = require('cheerio');
const { join } = require('path');
const { art } = require('@/utils/render');
const asyncPool = require('tiny-async-pool');
const { parseDate } = require('@/utils/parse-date');

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};

const baseUrl = 'https://tfc-taiwan.org.tw';

const parseList = (item) => {
    const a = item.find('.entity-list-title a');
    return {
        title: a.text(),
        description: item.find('.entity-list-body').text(),
        link: new URL(a.attr('href'), baseUrl).href,
        pubDate: item.find('.post-date').length ? parseDate(item.find('.post-date').text(), 'YYYY-MM-DD') : undefined,
        image: item.find('.entity-list-img img').attr('src').split('?')[0],
    };
};

const parseItems = (list, tryGet) =>
    asyncPoolAll(10, list, (item) =>
        tryGet(item.link, async () => {
            const { data: response } = await got(item.link);
            const $ = cheerio.load(response);

            $('.field-name-field-addthis, #fb-root, .fb-comments, .likecoin-embed, style[type="text/css"]').remove();

            item.description = art(join(__dirname, 'templates/article.art'), {
                headerImage: item.image,
                content: $('#block-system-main .node-content').html(),
            });

            item.pubDate = $('meta[property="article:published_time"]').attr('content');
            item.updated = $('meta[property="article:modified_time"]').attr('content');
            item.category = $('.node-tags .field-item')
                .toArray()
                .map((item) => $(item).text());

            return item;
        })
    );

module.exports = {
    baseUrl,
    parseList,
    parseItems,
};
