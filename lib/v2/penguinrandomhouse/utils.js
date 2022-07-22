const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const dateParser = require('@/utils/dateParser');

const parseBookInList = (element) => {
    const $ = cheerio.load(element);
    const title = $('h2').first().text();
    const author = $('h2.author').first().text();
    const description = $('.desc').first().text();
    let imageSrc = $('img.cover__backcover').attr('src');
    if (!imageSrc) {
        imageSrc = $('img.img-responsive').attr('data-src');
    }

    return art(path.join(__dirname, 'templates/book.art'), {
        title,
        author,
        description,
        imageSrc,
    });
};

const parseList = async (items, ctx) =>
    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.url, async () => {
                const itemRes = await got({
                    method: 'get',
                    url: item.url,
                });

                const itemPage = itemRes.data;
                const $ = cheerio.load(itemPage);

                const description = $('h2.read-down-text>p').first().text();

                let mainBlock = '';
                $('.awesome-list>li').map((i, element) => {
                    mainBlock += parseBookInList(element);
                });

                const result = {
                    title: item.title,
                    description: `<p>${description}</p><br>` + mainBlock,
                    pubDate: dateParser(new Date().toISOString()), // No time
                    link: item.url,
                };

                return result;
            })
        )
    );

module.exports = {
    parseList,
};
