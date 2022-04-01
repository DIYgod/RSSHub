/*

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {

    const url = `https://thejewishmuseum.org/exhibitions`;

    const response = await got({
        url: url,
        method: "GET",
        // insecureHTTPParser: true
    });

    const $ = cheerio.load(response.data)

    const items = [];

    $("article.exhibition").each((i, elem) => {
        items.push({
            title: $("h3", elem).text().trim(),
            link: "https://thejewishmuseum.org" + $("a", elem).attr("href"),
        })
    })

    console.log(items)

    ctx.state.data = {
        title: "Jewish Museums - Exhibitions",
        link: "https://thejewishmuseum.org/exhibitions",
        item: items
    }

}

*/

const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `https://thejewishmuseum.org/exhibitions`;

    ctx.state.data = await buildData({
        link,
        url: link,
        title: `Jewish Museums - Exhibitions`,
        item: {
            item: 'article',
            title: `$('article.exhibition h3').text().trim()`,
            link: `$('article.exhibition > a').attr('href')`,
            // guid: `new Date($('.post-time').attr('datetime')).getTime()`, // guid必须唯一，这是RSS的不同item的标志
        },
    });
};
