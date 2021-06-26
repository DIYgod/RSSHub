const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://91porny.com/video/category/hot-list';
const base = 'https://91porny.com'
const iframeBaseUrl = 'https://91porny.com/video/embed/';
// async function getVideo(url) {
//     const response = await got(url);
//     const data = response.data;
//     const $ = cheerio.load(data);
//     const iframe = $('#videoEmbedHtml').val();
//     return iframe;
// }
async function generateIframe(url) {
    const videoId = url.split('/')[3];
    const src = iframeBaseUrl + videoId;
    return "<iframe src=" + src + " frameborder='0' width='640' height='340' scrolling='no' allowfullscreen></iframe>"
}

async function generateItems(elems, loadedData) {
    let items = new Array();
    for (const i of elems) {
        const item = loadedData(i);
        const url = item.find('a').attr('href');
        const link = base + url
        const title = item.find('a').text();
        const cover = item.find('div .img').attr('style').replace("\'(s+)\'", '/');
        const single = {
            title: title,
            description: '<div><img src=' + cover.split('\'')[1] + ' /></div>',
            link: link,
        };
        items.push(single);
    }
    return items
};
module.exports = async (ctx) => {

    const response = await got(`${host}`);
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
