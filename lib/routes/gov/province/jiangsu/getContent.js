const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

const urlTemplate = (homePage, cid, uid) => {
    let template = `${homePage}/col/col${cid}/index.html`;
    if (uid) {
        template += `?uid=${uid}&pageNum=`;
    }
    return template;
};

module.exports = async (homePage, cid, uid, totalPage = 1) => {
    let title = '';
    let description = '';
    let item = [];
    try {
        const result = await extract(homePage, cid, uid);
        title = result.title;
        description = result.description;
        item = result.item;

        const promises = [];
        for (let page = 2; page <= totalPage; page++) {
            promises.push(extract(homePage, cid, uid, page));
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

    const link = urlTemplate(homePage, cid);

    return { title, link, description, item };
};

async function extract(homePage, cid, uid, page = 1) {
    const pageLink = urlTemplate(homePage, cid, uid);

    const response = await got.get(`${pageLink}${page}`);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $(`#${uid}`)
        .html()
        .match(/<li>.+<\/li>/g);

    const resultItem = list.map((item) => {
        const $item = cheerio.load(item)('li');
        const $aTag = $item.find('a');

        const title = $aTag.text();
        const description = $aTag.attr('title');
        let pubDate = $item.find('span').text();
        pubDate = new Date(pubDate).toUTCString();
        const link = $aTag.attr('href');

        return { title, description, pubDate, link };
    });

    if (page === 1) {
        const title = $('head title');
        const [name, category] = $(title).text().split(' ');
        return {
            title: category,
            description: `${category} - ${name}`,
            item: resultItem,
        };
    }

    return resultItem;
}
