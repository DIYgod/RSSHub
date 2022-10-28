const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.cmse.gov.cn';
    const currentUrl = `${rootUrl}/fxrw/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('#list li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text().split('：').pop().trim(),
                link: new URL(item.attr('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('.infoR').first().text().trim(), 'YYYY年M月D日H时m分'), +8),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: new URL(item.find('img').attr('src'), currentUrl).href,
                    description: item.find('.info').html(),
                }),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
