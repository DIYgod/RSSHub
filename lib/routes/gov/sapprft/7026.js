const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const { channel } = ctx.params;
    let id = '';
    switch (channel) {
        case 'importednetgame':
            id = 7027;
            break;
        case 'importedvideogame':
            id = 7028;
            break;
        case 'domesticnetgame':
            id = 7029;
            break;
        case 'gamechange':
            id = 11083;
            break;
        default:
            ctx.throw(404, 'Cannot find page');
            return;
    }
    const host = `http://www.sapprft.gov.cn`;
    const link = host + `/sapprft/channels/` + id.toString() + `.shtml`;
    const listData = await got.get(link + '?' + new Date().getTime()); // 避免CDN缓存
    const $ = cheerio.load(listData.data);
    const list = $('.jar2l_list ul li');

    ctx.state.data = {
        title: '国家新闻出版广电总局 - ' + $('.jar2l_tname').text(),
        link: link,
        item: await Promise.all(
            list
                .map(async (index, item) => {
                    item = $(item);
                    const contenlUrl = host + item.find('a').attr('href');
                    const description = await ctx.cache.tryGet(contenlUrl, async () => {
                        const fullText = await got.get(contenlUrl);
                        const fullTextData = cheerio.load(fullText.data);
                        const table = fullTextData('table');
                        table.find('td').removeAttr('style');
                        return table.html();
                    });
                    return {
                        title: item.find('a').text(),
                        description: description,
                        pubDate: date(item.find('span').text()),
                        link: contenlUrl,
                    };
                })
                .get()
        ),
    };
};
