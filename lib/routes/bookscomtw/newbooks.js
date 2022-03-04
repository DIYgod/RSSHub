const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const url = `https://www.books.com.tw/web/${ctx.params.category}/`;
    const { data } = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(data);
    const list = $('div.mod_a div.wrap div.item');
    const items = list
        .map((i, item) => {
            item = $(item);
            const title = item.find('h4').text().trim();
            let imgLink = item.find('a img.cover').attr('src').trim();
            imgLink = imgLink.slice(imgLink.indexOf('https', 1), imgLink.indexOf('.jpg') + 4);
            const link = item.find('a').attr('href');
            const desc = item.find('div.txt_cont p').text().trim();
            const author = item.find('li.info>a').text();
            const publisher = item.find('li.info span>a').text();
            const pubInfo = item.find('li.info').text();
            let price = item.find('ul.price li.set2 strong');
            price = price.length === 1 ? parseInt(price.text().trim()) : parseInt(price.eq(0).text() > 10 ? ((price.eq(1).text() * 100) / price.eq(0).text()).toFixed() : ((price.eq(1).text() * 10) / price.eq(0).text()).toFixed());
            return {
                title,
                description: `${desc}<br><img src="${imgLink}" alt="${title}"><br>NT$${price}元<br>${pubInfo}`,
                link: link.slice(0, link.indexOf('?')),
                author: `${author} / ${publisher}`,
            };
        })
        .get();
    ctx.state.data = {
        title: $('title').text(),
        link: URL,
        item: items,
    };
};
