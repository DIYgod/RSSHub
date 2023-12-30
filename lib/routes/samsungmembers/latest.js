const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'http://www.samsungmembers.cn/bbs/';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.ImgList dl dt')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve('http://www.samsungmembers.cn/', a.attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);
                item.pubDate = new Date(content('p.data').text() + ' GMT+8').toUTCString();
                item.description = content('div.BSHARE_POP').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '三星盖乐世社区 - 最新帖子',
        link: currentUrl,
        item: items,
    };
};
