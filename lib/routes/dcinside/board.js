const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const domain = 'https://m.dcinside.com';

const headers = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    Host: 'm.dcinside.com',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Mobile Safari/537.36',
};

async function getData(ctx, link) {
    const { body } = await got.get(link, { headers });
    const $ = cheerio.load(body);
    const { path } = url.parse(link);
    const key = `dcinside${path}`;

    let result = await ctx.cache.get(key);
    if (result) {
        return result;
    }

    result = {
        title: $('head title').text().trim(),
        pubDate: new Date($('body > div.container > div > div > section > div.gallview-tit-box > div > ul > li:nth-child(2)').text()),
        link,
        description: $('body > div.container > div > div > section > div.gall-thum-btm > div > div.thum-txt').html(),
    };

    ctx.cache.set(key, result);
    return result;
}

async function getItems(ctx, $) {
    return Promise.all(
        $('body > div > div > div > section > ul.gall-detail-lst > li:not([class]) > div > a.lt')
            .toArray()
            .map((row) => getData(ctx, row.attribs.href))
    );
}

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${domain}/board/${id}`;

    const { body } = await got.get(link, { headers });
    const $ = cheerio.load(body);
    const rss = {
        title: $('head title').text(),
        description: $('head title').text(),
        link,
        item: await getItems(ctx, $),
    };
    rss.item = rss.item.sort((a, b) => b.pubDate - a.pubDate);
    ctx.state.data = rss;
};
