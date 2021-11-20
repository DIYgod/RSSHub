const got = require('@/utils/got');
const cheerio = require('cheerio');

async function getImgUrls(link) {
    const response = await got(link);
    const data = response.data;
    const $ = cheerio.load(data);
    const elems = $('img', '#wind_read_content_id').get();
    let urls = '';
    for (const i of elems) {
        const item = $(i);
        const src = item.attr('src');
        urls = urls + '<img src=' + src + '/>' + '<br/>';
    }
    return urls;
}

module.exports = {
    getImgUrls,
};
