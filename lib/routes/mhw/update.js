const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url1 = 'http://game.capcom.com/world/cn/infomation.html';
    const response1 = await got({
        method: 'get',
        url: url1,
    });
    let $ = cheerio.load(response1.data);
    const result1 = $('.version')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                description: item.children('div').html(),
                link: url1,
                author: 'MONSTER HUNTER: WORLD',
            };
        })
        .get();

    const url2 = 'https://www.monsterhunter.com/update/mhw/cn/';
    const response2 = await got({
        method: 'get',
        url: url2,
    });

    $ = cheerio.load(response2.data);
    let result2 = $('.panel-list a')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('h3').text().trim(),
                link: url2 + item.attr('href'),
            };
        })
        .get();

    result2 = await Promise.all(
        result2.map(async (item) =>
            Promise.resolve(
                await ctx.cache.tryGet(item.link, async () => {
                    const response = await got.get(item.link);
                    const $ = cheerio.load(response.data);
                    const title = $('.page-ttl').text().trim();
                    $('.page-ttl').remove();

                    return {
                        title: title || item.title,
                        description: $('.conts').html(),
                        link: item.link,
                        pubDate: item.pubDate,
                        author: 'MONSTER HUNTER WORLD: ICEBORNE',
                    };
                })
            )
        )
    );

    ctx.state.data = {
        title: '怪物猎人世界更新情报',
        link: url2,
        item: result2.concat(result1),
    };
};
