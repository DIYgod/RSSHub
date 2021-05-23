const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (link, totalPage = 1) => {
    let title = '';
    let description = '';
    let item = [];
    try {
        const result = await extract(link);
        title = result.title;
        description = result.description;
        item = result.item;

        const promises = [];
        for (let page = 2; page <= totalPage; page++) {
            promises.push(extract(link, page));
        }
        const pageContent = await Promise.all(promises);
        for (const content of pageContent) {
            if (Array.isArray(content)) {
                item = item.concat(content);
            }
        }
    } catch (err) {
        logger.error('Cannot load page content');
    }

    return { title, link, description, item };
};

async function extract(url, page = 1) {
    let pageLink = `${url}index.html`;
    if (page !== 1) {
        pageLink = `${url}index_${page - 1}.html`;
    }

    const response = await got.get(pageLink);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.center ul li');

    const resultItem = list.map((index, item) => {
        const $item = $(item);
        const $aTag = $item.find('a');

        const title = $aTag.text();
        const description = $aTag.attr('title');
        let pubDate = $item.find('span').text();
        pubDate = new Date(pubDate).toUTCString();
        let link = $aTag.attr('href');
        link = `${url}${link.substring(2)}`;

        return { title, description, pubDate, link };
    });

    if (page === 1) {
        const name = $('head title');
        const category = $('.zxft_title span').text();
        return {
            title: category,
            description: `${category} - ${name}`,
            item: resultItem.get(),
        };
    }

    return resultItem.get();
}
