const got = require('@/utils/got');
const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const {name} = ctx.params;
    const url = `https://nocturnalscans.com/MANGA/${name}/`;
    const response = await got(url);
    const {data} = response;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const jsPath = '#chapterlist > ul > li > div > div > a';
    const episodes = $(jsPath).map((index, item) => {
        const {href} = item.attribs;
        const titlePath = `#chapterlist > ul > li:nth-child(${index + 1}) > div > div > a > span.chapternum`;
        const title = $(titlePath).text();
        const date = new Date(Date.now() - index * 1000).toUTCString();
        return {
            title, description: ``, link: href,
            pubDate: date,
        };
    }).get();
    const link = episodes[0].link;


    const query = cheerio.load((await got({method: 'get', url: link})).data);
    let images = [];
    query('script').each(function () {
            const symbol = 'ts_reader.run';
            let text = query(this).text().trim();
            if (text.match(symbol) !== null) {
                text.trim();
                text = text.substring(symbol.length + 1);
                text = text.substring(0, text.length - 2);
                images = JSON.parse(text).sources[0].images;
            }
        }
    );
    episodes[0].description = ` ${images.map((url) => `<img src='${url}' />`).join('')}`;


    const title = $(`#post-62 > div.bixbox.animefull > div.bigcontent.nobigcover > div.infox > h1`).text();
    const cover = $(`#post-62 > div.bixbox.animefull > div.bigcontent.nobigcover > div.thumbook > div.thumb > img`).first().attr('src');
    const description = $(`#post-62 > div.bixbox.animefull > div.bigcontent.nobigcover > div.infox > div:nth-child(3) > div > p`).text();

    ctx.state.data = {
        title,
        link: url,
        image: cover,
        description,
        item: episodes,
    };
};
