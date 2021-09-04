const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

// function changeStr(str, index, changeStr) {
//     return str.substr(0, index) + changeStr + str.substr(index + changeStr.length);
// }
//
// function find(str, cha, num) {
//     let x = str.indexOf(cha);
//     for (let i = 0; i < num; i++) {
//         x = str.indexOf(cha, x + 1);
//     }
//     return x;
// }
const gbk2utf8 = (s) => iconv.decode(s, 'gbk');

module.exports = async (ctx) => {
    const category = ctx.params.category.toLowerCase();
    const id = ctx.params.id.toLowerCase();
    const baseUrl = 'http://www.dybz9.net';
    const novelUrl = `${baseUrl}/${category}/${id}/`;

    const response = await got.get(novelUrl, {
        responseType: 'buffer',
    });
    // const response = await got.get(novelUrl);

    const $ = cheerio.load(gbk2utf8(new Buffer.from(response.data)));

    const lists = $('.container .chapter-list .bd ul li').slice(0, 3);
    const chapter_item = lists
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: baseUrl + e.attribs.href,
        }))
        .get();
    const title = chapter_item.title;

    const items = await Promise.all(
        chapter_item.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(item.link, {
                responseType: 'buffer',
            });

            const responseHtml = iconv.decode(response.data, 'GBK');
            const $ = cheerio.load(responseHtml);

            const description = $('.page-content').html();

            const single = {
                title: item.title,
                description,
                link: item.link,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: title,
        link: novelUrl,
        item: items,
    };
};
