const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.wineyun.com/csborder';

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://www.wineyun.com',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const $list = $('div a.topitem')
        .slice(0, 10)
        .get();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).attr('title');
            const subtitle = $(item)
                .find('div.fr strong')
                .html();
            const itemPicUrl = $(item)
                .find('div.fl img')
                .attr('src');
            const href = $(item).attr('href');
            const price = $(item)
                .find('span.price')
                .text();
            const itemDetailurl = 'http://www.wineyun.com' + href;

            const single = {
                title: `${price} ${title} <br> `,
                link: itemDetailurl,
                description: '',
            };

            const detail = await got({
                method: 'get',
                url: itemDetailurl,
                headers: {
                    Referer: 'http://www.wineyun.com',
                },
            });

            {
                const detailData = detail.data;
                const $ = cheerio.load(detailData);
                $('div#htmlDetails p img').replaceWith('');
                single.description = `${subtitle} <br><img src ="${itemPicUrl}"><br>` + $('div#htmlDetails').html();
            }
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '酒云网 | 最新跨境',
        link: url,
        description: '酒云网 | 最新跨境商品',
        item: resultItem,
    };
};
