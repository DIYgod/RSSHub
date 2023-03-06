const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const host = 'https://www.sony.com';
function generateRssData(item, index, arr) {
    const data = {};
    data.title = item.title;
    data.pubDate = item.publicationDate;
    const url = item.url;
    if (url.startsWith('http')) {
        data.url = url;
    } else if (url.startsWith('//')) {
        data.url = 'https:' + url;
    } else {
        data.url = host + url;
    }

    arr[index] = data;
}
module.exports = async (ctx) => {
    const { productType, productId } = ctx.params;
    const url = `${host}/electronics/support/${productType}/${productId}/downloads`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const contents = $(`script:contains("window.__PRELOADED_STATE__.downloads")`).html();

    const regex = /window\.__PRELOADED_STATE__\.downloads\s*=\s*({.*?});\s*window\.__PRELOADED_STATE__/s;

    const match = contents.match(regex);
    let results = {};
    if (match) {
        results = JSON.parse(match[1]).searchResults.results;
    }
    results.forEach(generateRssData);
    ctx.state.data = {
        title: `Sony - ${productId.toUpperCase()}`,
        link: url,
        description: `Sony - ${productId.toUpperCase()}`,
        item: results.map((item) => ({
            title: item.title,
            link: item.url,
            description: art(path.join(__dirname, 'templates/software-description.art'), {
                item,
            }),
            pubDate: item.pubDate,
        })),
    };
};
