const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'http://cl5a7.com/rss.php?fid=15';

async function generateItems(ctx, elems, loadedData) {
    const items = new Array();
    let channelLink = loadedData('link').slice().eq(0).text();
    channelLink = new URL(channelLink);
    // if (channelLink.hostname.indexOf("caoliu1024") > -1) {
    //     return items;
    // }
    for (const i of elems) {
        const item = loadedData(i);
        const title = item.find('title').text();
        const link = item.find('link').text();
        const description = item.find('link').text();
        // eslint-disable-next-line no-await-in-loop
        // const description = await ctx.cache.tryGet(link, async () => {
        //     const response = await got(link);
        //     const data = response.data;
        //     const $ = cheerio.load(data);
        //     const elems = $('img', '#wind_read_content_id').get();
        //     let urls = "";
        //     for (const i of elems) {
        //         const item = $(i);
        //         const src = item.attr('src');
        //         urls = urls + '<img src=' + src + '/>' + '<br/>';
        //     }
        //     console.log(urls);
        //     return urls;
        // });
        const single = {
            title: title,
            description: description,
            link: link
        };
        items.push(single);
    }
    return items;
};
module.exports = async (ctx) => {

    const response = await got(url);
    const data = response.data;
    const $ = cheerio.load(data, {
        normalizeWhitespace: true,
        xmlMode: true
    });
    const elems = $('item').get();
    const items = await generateItems(ctx, elems, $);
    ctx.state.data = {
        title: 'caoliu1024_达盖尔',
        link: url,
        item: items,
    };
};
