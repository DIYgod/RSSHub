const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.txrjy.com';

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? '1';
    const url = `${rootUrl}/c114-listnewtopic.php?typeid=${channel}`;

    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const title = $('div.z > a').last().text();
    const list = $('tbody > tr')
        .slice(0, 25)
        .map((_, item) => ({
            title: $(item).find('td.title2').text(),
            link: new URL($(item).find('td.title2 > a').attr('href'), rootUrl).href,
            author: $(item).find('td.author').text(),
            pubDate: timezone(parseDate($(item).find('td.dateline').text(), 'YYYY-M-D HH:mm'), +8),
            category: $(item).find('td.forum').text(),
        }))
        .filter((_, item) => item.title)
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });
                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                item.description = content('div.c_table')
                    .map((_, item) =>
                        art(path.join(__dirname, 'templates/fornumtopic.art'), {
                            content: content(item)
                                .find('td.t_f')
                                .find('div.a_pr')
                                .remove()
                                .end()
                                .html()
                                ?.replace(/(<img.*?) src=".*?"(.*?>)/g, '$1$2')
                                .replace(/(<img.*?)zoomfile(.*?>)/g, '$1src$2'),
                            pattl: content(item)
                                .find('div.pattl')
                                .html()
                                ?.replace(/(<img.*?) src=".*?"(.*?>)/g, '$1$2')
                                .replace(/(<img.*?)zoomfile(.*?>)/g, '$1src$2'),
                            author: content(item).find('a.xw1').text().trim(),
                        })
                    )
                    .get()
                    .join('\n');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `通信人家园 - 论坛 ${title}`,
        link: url,
        item: items,
    };
};
