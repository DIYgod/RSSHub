const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const dateUtil = require('@/utils/date');
module.exports = async (ctx) => {
    let link = ctx.params.link;
    link = link.replace(/:\/\//, ':/').replace(/:\//, '://');

    const response = await got.get(link);
    const contentType = response.headers['content-type'] || '';
    // 若没有指定编码，则默认utf-8
    let charset = 'utf-8';
    for (const attr of contentType.split(';')) {
        if (attr.indexOf('charset=') >= 0) {
            charset = attr.split('=').pop();
        }
    }
    const responseData = charset === 'utf-8' ? response.data : iconv.decode((await got.get({ url: link, responseType: 'buffer' })).data, charset);
    const $ = cheerio.load(responseData);
    if (
        $('div#footer p em')
            .text()
            .startsWith('7')
    ) {
        // discuz 7.x 系列
        const list = $('tbody[id^="normalthread"] tr');
        ctx.state.data = {
            title: $('head > title').text(),
            link: link,
            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);
                        return {
                            title: item.find('span[id^=thread] a').text(),
                            description: item.find('span[id^=thread] a').text(),
                            link: item.find('span[id^=thread] a').attr('href'),
                            pubDate: dateUtil(item.find('td.author em').text()),
                        };
                    })
                    .get(),
        };
    } else if (
        $('div#frt p em')
            .text()
            .toUpperCase()
            .startsWith('X')
    ) {
        // discuz X 系列
        const list = $('tbody[id^="normalthread"] tr');
        ctx.state.data = {
            title: $('head > title').text(),
            link: link,
            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);
                        return {
                            title: item.find('a.xst').text(),
                            description: item.find('a.xst').text(),
                            link: item.find('a.xst').attr('href'),
                            pubDate: dateUtil(
                                item
                                    .find('td.by:nth-child(3) em span')
                                    .last()
                                    .text()
                            ),
                        };
                    })
                    .get(),
        };
    } else {
        throw Error('不支持当前Discuz版本.');
    }
};
