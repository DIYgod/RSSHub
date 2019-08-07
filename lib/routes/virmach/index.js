const got = require('@/utils/got');
const cheerio = require('cheerio');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const url = `https://billing.virmach.com/cart.php?a=add&pid=81`;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            cookie: `__cfduid=d77060886bf4d7ec283a09dec9230c4141564968556; WHMCSeXMvUTd4giP5=aa9kf4k9d12qbvh2lvkds7ocb0; _ga=GA1.2.2012936821.1564968557; _gid=GA1.2.1337639072.1564968557; _gat=1; _fbp=fb.1.1564968557821.529607599; __stripe_mid=24c90ca9-d79f-4816-a452-f0b4c3e2b5ee; __stripe_sid=1bbe160e-da94-4806-a429-562a356f5a64; crisp-client%2Fsession%2Fb7400af9-fa17-4b41-9910-dbdc0f3ad1f7=session_7149b768-f66c-4c38-aa2d-3f284d26a1e0`,
        },
    });
    const $ = cheerio.load(response.data);

    const text = $("select[id='Select Location']")
        .find('option')
        .get()
        .map((item) => $(item).text())
        .join('\n');
    const hash = md5(text);

    ctx.state.data = {
        title: $('title')
            .text()
            .split('-')[0]
            .trim(),
        link: `https://billing.virmach.com/`,
        description: $('title')
            .text()
            .split('-')[1]
            .trim(),
        item: [
            {
                title: 'Locations',
                description: `${text.replace(new RegExp("\n", 'g'), "<b />")}`,
                pubDate: new Date().toUTCString(),
                guid: url,
                link: url,
            },
        ],
    };
};

// // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
// const browser = await require('@/utils/puppeteer')();
// // 创建一个新的浏览器页面
// const page = await browser.newPage();
// page.setExtraHTTPHeaders({
//      cookie: `__cfduid=d77060886bf4d7ec283a09dec9230c4141564968556; WHMCSeXMvUTd4giP5=aa9kf4k9d12qbvh2lvkds7ocb0; _ga=GA1.2.2012936821.1564968557; _gid=GA1.2.1337639072.1564968557; _gat=1; _fbp=fb.1.1564968557821.529607599; __stripe_mid=24c90ca9-d79f-4816-a452-f0b4c3e2b5ee; __stripe_sid=1bbe160e-da94-4806-a429-562a356f5a64; crisp-client%2Fsession%2Fb7400af9-fa17-4b41-9910-dbdc0f3ad1f7=session_7149b768-f66c-4c38-aa2d-3f284d26a1e0`,
// });
// // 访问指定的链接
// const link = 'https://billing.virmach.com/cart.php?a=add&pid=81';//'https://sspai.com/series';
// await page.goto(link, {waitUntil: 'domcontentloaded', referer: `https://billing.virmach.com/`});
// // 渲染目标网页
// const html = await page.evaluate(
//     () => {
//         // 选取渲染后的 HTML
//         // document.querySelector('div.new-series-wrapper').innerHTML
//         return document.getElementsByTagName("html")[0].innerHTML
//     }
// );
// // 关闭浏览器进程
// browser.close();
// const $ = cheerio.load(html); // 使用 cheerio 加载返回的 HTML
// console.log(html.indexOf("Amsterdam") >= 0)
// // console.log(response.data.indexOf('Amsterdam') >= 0);

// var phantomJsCloud = require("phantomjscloud");
// var browser = new phantomJsCloud.BrowserApi();
// browser.requestSingle({ url: "https://billing.virmach.com/cart.php?a=confproduct&i=0",
//     renderType: "automation",
//     overseerScript:'await page.waitForNavigation({waitUntil:"domcontentloaded"}); \
//         await page.meta.log(await page.content({selector:"label#lbl_id_1",type:"plainText"})); \
//         await page.click("input#btn_id_1"); \
//         await page.meta.log(await page.content({selector:"label#lbl_id_1",type:"plainText"})); \
//         //VERY IMPORTANT: comments need a newline character at the end, otherwise the following lines do not get executed.  \n \
//         page.render.content(); \
//         page.meta.store.set("key1",{some:"json"});  \
//         page.meta.logError("test error",{no:1});',
// }, (err, userResponse) => {
//     //can use a callback like this example, or a Promise (see the Typescript example below)
//     if (err != null) {
//         throw err;
//     }
//     console.log(JSON.stringify(userResponse.content));
// });
