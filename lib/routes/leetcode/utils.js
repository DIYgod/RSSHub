const cheerio = require('cheerio');

const ProcessFeed = async (list) => {
    const host = 'https://leetcode.com';
    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $title = $('b');
            const description = $('span').eq(0).text() + $('span').eq(1).text();
            // 还原相对链接为绝对链接
            const pubDate = $('span').eq(2).text();
            const bb = $('a[href]').get()[0];
            const itemUrl = host + $(bb).attr('href');
            let n = 0,
                h = 0;
            const n1 = pubDate.search(/year/);
            const n2 = pubDate.search(/month/);
            const n3 = pubDate.search(/week/);
            const n4 = pubDate.search(/day/);
            const n5 = pubDate.search(/hour/);
            const n6 = pubDate.search(/minute/);
            if (n1 !== -1) {
                n = n + parseInt(pubDate.substring(n1 - 3, n1 - 1)) * 365;
            }
            if (n2 !== -1) {
                n = n + parseInt(pubDate.substring(n2 - 3, n2 - 1)) * 30;
            }
            if (n3 !== -1) {
                n = n + parseInt(pubDate.substring(n3 - 3, n3 - 1)) * 7;
            }
            if (n4 !== -1) {
                n = n + parseInt(pubDate.substring(n4 - 3, n4 - 1)) * 1;
            }
            if (n5 !== -1) {
                h = h + parseInt(pubDate.substring(n5 - 3, n5 - 1)) * 3600;
            }
            if (n6 !== -1) {
                h = h + parseInt(pubDate.substring(n6 - 3, n6 - 1)) * 60;
            }
            const now = new Date();
            const Datenow = new Date(now.getTime() - n * 24 * 3600 * 1000 - h * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                description: description,
                link: itemUrl,
                guid: itemUrl,
                pubDate: Datenow,
            };
            return Promise.resolve(Object.assign({}, single));
        })
    );
};
module.exports = {
    ProcessFeed,
};
