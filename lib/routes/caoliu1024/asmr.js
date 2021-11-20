const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'http://caoliu1024.com/rss.php?fid=27';

async function generateItems(elems, loadedData) {
    const items = new Array();
    let channelLink = loadedData('link').slice().eq(0).text();
    channelLink = new URL(channelLink);
    if (channelLink.hostname.indexOf('caoliu1024') <= -1) {
        return items;
    }
    for (const i of elems) {
        const item = loadedData(i);
        const title = item.find('title').text();
        const description = item.find('description').text();
        const link = item.find('link').text();
        // const author = item.find('author').text();
        // const category = item.find('category').text();
        // const pubDate = item.find('pubdate').text();
        const single = {
            title,
            description,
            link,
            // author: author,
            // category: category,
            // pudDate: pubDate
        };
        items.push(single);
    }
    await items;
}
module.exports = async (ctx) => {
    const response = await got(url);
    const data = response.data;
    const $ = cheerio.load(data, {
        normalizeWhitespace: true,
        xmlMode: true,
    });
    const elems = $('item').get();
    const items = await generateItems(elems, $);
    ctx.state.data = {
        title: 'caoliu1024_asmr',
        link: url,
        item: items,
    };
};
