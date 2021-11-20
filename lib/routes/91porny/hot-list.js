const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://91porny.com/video/category/hot-list';
const base = 'https://91porny.com';

async function generateItems(elems, loadedData) {
    const items = new Array();
    for (const i of elems) {
        const item = loadedData(i);
        const url = item.find('a').attr('href');
        const link = base + url;
        const title = item.find('a').text();
        const cover = item.find('div .img').attr('style').replace("'(s+)'", '/');
        const single = {
            title,
            description: '<div><img src=' + cover.split("'")[1] + ' /></div>',
            link,
        };
        items.push(single);
    }
    await items;
}
module.exports = async (ctx) => {
    const response = await got(String(host));
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const elems = $('div[class=video-elem]').slice().get();
    const items = await generateItems(elems, $);

    ctx.state.data = {
        title: '91porny hot-list',
        link: 'https://91porny.com',
        item: items,
    };
};
