const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

module.exports = async (ctx) => {
    const response = await cloudscraper({
        method: 'GET',
        uri: 'https://www.hhgal.com/',
        headers: {
            Refer: 'https://www.hhgal.com/',
        },
        agentOptions: {
            ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256',
        },
    });

    const $ = cheerio.load(response);
    const list = $('#article-list').find('.article');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.hhgal.com/',
        description: '忧郁的loli - Galgame资源发布站',
        item:
            list &&
            list
                .slice(1)
                .map((index, item) => {
                    item = $(item);
                    const time = `${item.find('.tag-article .label.label-zan').text()}`;
                    const math = /\d{4}-\d{2}-\d{2}/.exec(time);
                    const pubdate = new Date(math[0]);

                    return {
                        title: item.find('h1').text(),
                        description: `${item.find('.info p').text()}`,
                        pubDate: pubdate,
                        link: item.find('h1 a').attr('href'),
                    };
                })
                .get(),
    };
};
