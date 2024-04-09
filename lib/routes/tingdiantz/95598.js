const got = require('@/utils/got');
const cheerio = require('cheerio');

const HOME_PAGE = 'http://www.sttcq.com';

module.exports = async (ctx) => {
    const province = ctx.params.province;
    const city = ctx.params.city;
    const district = ctx.params.district;

    let url;
    if (district) {
        url = `${HOME_PAGE}/td/${province}/${city}/${district}`;
    } else {
        url = `${HOME_PAGE}/td/${province}/${city}`;
    }

    const response = await got.get(url);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.news-blocks ul li');

    ctx.state.data = {
        title: $('.main-nav2.clearfix').text(),
        link: url,
        item: list
            .map((index, item) => {
                const $item = $(item);
                const $aTag = $item.find('a');
                const link = $aTag.attr('href');
                const title = $aTag.text();

                let pubDate = $item.find('span').text();
                pubDate = new Date(pubDate).toUTCString();

                return {
                    title,
                    description: '停电通知',
                    link: `${HOME_PAGE}${link}`,
                    pubDate,
                };
            })
            .get(),
    };
};
