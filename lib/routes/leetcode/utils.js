const cheerio = require('cheerio');

const ProcessFeed = async (list, country) => {
    let host;
    if (country === 'us') {
        host = 'https://leetcode.com';
    } else {
        host = 'https://leetcode-cn.com';
    }
    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $title = $('b');
            const description =
                $('span')
                    .eq(0)
                    .text() +
                $('span')
                    .eq(1)
                    .text();
            // 还原相对链接为绝对链接

            const pubDate = $('span')
                .eq(2)
                .text();
            const bb = $('a[href]').get()[0];
            const itemUrl = host + $(bb).attr('href');
            let n = 0,
                h = 0;
            let n1, n2, n3, n4, n5, n6;
            if (country === 'us') {
                n1 = pubDate.search(/year/);
                n2 = pubDate.search(/month/);
                n3 = pubDate.search(/week/);
                n4 = pubDate.search(/day/);
                n5 = pubDate.search(/hour/);
                n6 = pubDate.search(/minute/);
            } else {
                n1 = pubDate.search(/年/);
                n2 = pubDate.search(/月/);
                n3 = pubDate.search(/周/);
                n4 = pubDate.search(/日/);
                n5 = pubDate.search(/小时/);
                n6 = pubDate.search(/分钟/);
            }

            if (n1 !== -1) {
                n = n + parseInt(pubDate[n1 - 2]) * 365;
            }
            if (n2 !== -1) {
                n = n + parseInt(pubDate[n2 - 2]) * 30;
            }
            if (n3 !== -1) {
                n = n + parseInt(pubDate[n3 - 2]) * 7;
            }
            if (n4 !== -1) {
                n = n + parseInt(pubDate[n4 - 2]) * 1;
            }
            if (n5 !== -1) {
                h = h + parseInt(pubDate[n5 - 2]) * 3600;
            }
            if (n6 !== -1) {
                h = h + parseInt(pubDate[n6 - 2]) * 60;
            }
            const now = new Date();
            const Datenow = new Date(now.getTime() - n * 24 * 3600 * 1000 - h * 1000).toISOString();
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
