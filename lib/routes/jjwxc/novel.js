const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const page_url = `http://www.jjwxc.net/onebook.php?novelid=${id}`;
    const response = await got({
        method: 'get',
        url: page_url,
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    let trList = $('table#oneboolt tr').slice(3, -1);
    if (trList.length > 10) trList = trList.slice(-10).get();

    const novelTitle = $('td.sptd h1 span').text();
    const author = $('td.sptd h2 span').text();

    const items = await Promise.all(
        trList.map(async (item) => {
            const $$ = cheerio.load(item);
            const tds = $$('td').get();
            const link = cheerio.load(tds[1])('a').first().attr((tds.length > 5)?'href':'rel');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            
            const chapterTitle = cheerio.load(tds[1]).text().trim();
            const title = `${chapterTitle}`;
            const description = cheerio.load(tds[2]).text().trim();
            let dateString = cheerio.load(tds[(tds.length > 5)?5:4])('td').attr('title').slice(-19).trim();
            const it = {
                title: title,
                description: description,
                pubDate: dateString,
                link: link,
                author: author,
            };
            ctx.cache.set(link, JSON.stringify(it));
            return Promise.resolve(it);
        })
    );

    ctx.state.data = {
        title: `小说${novelTitle}更新|晋江文学城`,
        link: page_url,
        description: `晋江文学城小说${novelTitle}更新`,
        item: items,
    };
};
