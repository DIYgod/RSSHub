const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const { channel, detail } = ctx.params;
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
    const target = $('.jar2l_list ul li');
    let url = '';
    for (const i in target) {
        const item = $(target[i]).find('a');
        if (~item.text().search(detail) || detail === 'new') {
            url = host + item.attr('href');
            break;
        }
    }
    if (!detail || url === '') {
        ctx.state.data = {
            title: '国家新闻出版广电总局 - ' + $('.jar2l_tname').text(),
            link,
            item: await Promise.all(
                target
                    .map(async (index, item) => {
                        item = $(item);
                        const contenlUrl = host + item.find('a').attr('href');
                        const description = await ctx.cache.tryGet(contenlUrl, async () => {
                            const fullText = await got.get(contenlUrl);
                            const $$ = cheerio.load(fullText.data);
                            let fullTextData = '';
                            $$('.jar2_editor table tbody tr')
                                .slice(1)
                                .each((index, item) => {
                                    item = $$(item).find('td');
                                    fullTextData += $$(item[0]).text().trim() + ' | ';
                                });
                            fullTextData = '| ' + fullTextData;
                            return fullTextData;
                        });
                        return {
                            title: item.find('a').text(),
                            description,
                            pubDate: date(item.find('span').text(), -8),
                            link: contenlUrl,
                        };
                    })
                    .get()
            ),
        };
    } else {
        const fullText = await got.get(url + '?' + new Date().getTime()); // 避免CDN缓存
        const $$ = cheerio.load(fullText.data);
        const list = $$('.jar2_editor table tbody tr');

        ctx.state.data = {
            title: '国家新闻出版广电总局 - ' + $('.jar2l_tname').text() + ' - ' + $$('.jar2_conT').text(),
            link: url,
            item: await Promise.all(
                list
                    .slice(1)
                    .map((index, item) => {
                        item = $$(item).find('td');
                        return {
                            title: $$(item[0]).text().trim(),
                            category: $$(item[1]).text().trim(),
                            description: $$(item[4]).text().trim(),
                            author: $$(item[2]).text().trim() + ' | ' + $$(item[3]).text().trim(),
                            pubDate: date($$(item[6]).text().trim(), -8),
                            guid: $$(item[5]).text().trim(),
                            link: url,
                        };
                    })
                    .get()
            ),
        };
    }
};
