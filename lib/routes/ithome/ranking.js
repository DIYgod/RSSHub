const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const option = ctx.params.type || '1';
    const link = `https://www.ithome.com/`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const config = {
        1: '24小时阅读榜',
        2: '周榜',
        3: '7天热评',
        4: '月榜',
    };

    const title = config[option];

    let elem = $('.lst.lst-2.hot-list').find('.bx').first();
    for (let i = 0; i < Number(option) - 1; ++i) {
        elem = elem.next();
    }
    const list = elem
        .find('li')
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
            };
            return info;
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(res.data);
                    const post = content('div#con div.content');
                    const paragraph = post.find('div#paragraph');
                    paragraph.find('img[data-original]').each((_, ele) => {
                        ele = $(ele);
                        ele.attr('src', ele.attr('data-original'));
                        ele.removeAttr('class');
                        ele.removeAttr('data-original');
                    });
                    item.description = paragraph.html();
                    item.pubDate = new Date(post.find('span#pubtime_baidu').text() + ' GMT+8').toUTCString();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `IT之家-${title}`,
        link: link,
        item: items,
    };
};
