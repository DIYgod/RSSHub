const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'http://www.caareviews.org';

const getList = async (url) => {
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('#infinite-content > div')
        .map((_index, item) => ({
            title: $(item).find('div.title').text().trim(),
            link: new URL($(item).find('div.title > em > a').attr('href'), rootUrl).href,
            author: $(item).find('div.contributors').text().trim(),
        }))
        .get();

    return list;
};

const getItems = async (ctx, list) =>
    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = cheerio.load(detailResponse.data);

                const coverUrl = new URL($('div.cover > a').attr('href'), rootUrl).href;
                const content = $('div.content.full-review').html();
                item.description = art(path.join(__dirname, 'templates/utils.art'), {
                    coverUrl,
                    content,
                });
                $('div.review_heading').remove();
                item.pubDate = parseDate($('div.header-text > div.clearfix').text());
                item.doi = $('div.crossref > a').attr('href').replace('http://dx.doi.org/', '');

                return item;
            })
        )
    );

module.exports = {
    rootUrl,
    getList,
    getItems,
};
