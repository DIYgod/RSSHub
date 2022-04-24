const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    let link;
    let subDomain = 0;
    if (id.endsWith('.eth') || id.length === 42 || id.length === 40) {
        link = 'https://mirror.xyz/' + id;
    } else {
        link = 'https://' + id + '.mirror.xyz';
        subDomain = 1;
    }

    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.body;
    const $ = cheerio.load(data);

    const author = $('div#__next > div.GlobalNavigation > div.GlobalNavigationContainer > div > div > div > div > div > a').text();

    // 标题
    const article = $('h1')
        .map(function () {
            return $(this).text();
        })
        .get();

    // 地址
    const addr = $('h1')
        .parent()
        .parent()
        .parent()
        .map(function () {
            return $(this).attr('href');
        })
        .get();

    // 发布日期
    const date = $('div#__next > div > div > div > div > div > div > div > div > div')
        .map(function () {
            return $(this).text();
        })
        .get();

    // 摘要
    const des = $('h1')
        .parent()
        .parent()
        .parent()
        .parent()
        .next()
        .next()
        .map(function () {
            return $(this).text();
        })
        .get();

    const items = [];
    article.forEach((item, index) => {
        items.push({
            title: item,
            author,
            description: des[index],
            pubDate: date[index],
            link: subDomain ? link + addr[index] : 'https://mirror.xyz' + addr[index],
        });
    });

    const title = author + ' - Mirror';
    ctx.state.data = {
        title,
        link,
        allowEmpty: true,
        item: items,
    };
};
