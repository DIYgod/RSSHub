const got = require('@/utils/got');
const url = require('url');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'yw';

    const ywUrl = type !== 'tt' ? 'https://news.jnu.edu.cn/jnyw/List/List_149.html' : 'https://news.jnu.edu.cn/jnyw/jdtt/';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        },
        url: ywUrl,
    });

    const $ = cheerio.load(response.data);

    if (type === 'tt') {
        // 暨大头条
        const list = $('ul[class=newsConList] > li')
            .map(function () {
                const info = {
                    title: $(this).find('div[class=title] > a').text(),
                    link: url.resolve(ywUrl, $(this).find('div[class=title] > a').attr('href')),
                    description: $(this).find('div[class=intro]').text(),
                    pubDate: new Date($(this).find('div[class=date]').text()).toUTCString(),
                };
                return info;
            })
            .get();

        const desc = '暨大头条';
        ctx.state.data = {
            title: desc,
            description: desc,
            link: ywUrl,
            item: list,
        };
    } else {
        // 暨南要闻
        const list = $('ul[class="newsList infoList infoListA"] > li')
            .map(function () {
                const info = {
                    title: $(this).find('a').text(),
                    link: $(this).find('a').attr('href'),
                    description: '',
                    pubDate: new Date($(this).find('span[class=date]').text()).toUTCString(),
                };
                return info;
            })
            .get();

        const out = await Promise.all(
            list
                .filter((item) => item.link)
                .map(async (item) => {
                    const itemUrl = url.resolve(ywUrl, item.link);
                    const cache = await ctx.cache.get(itemUrl);
                    if (cache) {
                        return Promise.resolve(JSON.parse(cache));
                    }
                    const response = await got.get(itemUrl);
                    const $ = cheerio.load(response.data);
                    item.description = $('div[class=conTxt]').html();
                    ctx.cache.set(itemUrl, JSON.stringify(item));
                    return item;
                })
        );

        const desc = '暨南要闻';

        ctx.state.data = {
            title: desc,
            description: desc,
            link: ywUrl,
            item: out,
        };
    }
};
