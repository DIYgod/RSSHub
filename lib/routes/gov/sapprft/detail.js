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
    if (url === '') {
        ctx.throw(404, 'Cannot find page');
        return;
    }
    const fullText = await got.get(url + '?' + new Date().getTime()); // 避免CDN缓存
    const $$ = cheerio.load(fullText.data);
    const list = $$('.jar2_editor table tbody tr');

    ctx.state.data = {
        title: '国家新闻出版广电总局 - ' + $('.jar2l_tname').text() + ' - ' + $$('.jar2_conT').text(),
        link: url,
        item: await Promise.all(
            list &&
                list.slice(1)
                    .map(async (index, item) => {
                        item = $$(item).find('td');
                        const text = [
                            $$(item[0]).text().trim(),
                            $$(item[1]).text().trim(),
                            $$(item[2]).text().trim(),
                            $$(item[3]).text().trim(),
                            $$(item[4]).text().trim(),
                            $$(item[5]).text().trim()
                        ];
                        return {
                            title: text[0],
                            category: text[1],
                            description: text[4],
                            author: text[2] + " | " + text[3],
                            pubDate: date(text[6]),
                            guid: text[5],
                            link: url
                        };
                    })
                    .get()
        ),
    };
};
