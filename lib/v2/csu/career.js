const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { unzip } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://career.csu.edu.cn';
    const link = `${baseUrl}/campus/index/category/1`;
    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('.infoList')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `${baseUrl}${item.find('a').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.span4').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                let $ = cheerio.load(response);

                const zipped = $('script[type="text/javascript"]')
                    .text()
                    .match(/Base64\.decode\(unzip\("(.*)"\)\./)[1];
                const { slice1, slice2 } = $('script[type="text/javascript"]')
                    .text()
                    .match(/"\)\.substr\((?<slice1>\d+)\)\)\.substr\((?<slice2>\d+)\)\);/).groups;
                const unzipped = Buffer.from(unzip(zipped).slice(slice1), 'base64').toString().slice(slice2);

                $ = cheerio.load(unzipped, null, false);
                item.description = $.html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.curr').text()} - ${$('head title').text()}`,
        link,
        item: items,
    };
};
