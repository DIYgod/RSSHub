const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.wineyun.com/miaofa';

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://www.wineyun.com',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const $list = $('div.groupinfo')
        .slice(0, 10)
        .get();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item)
                .find('h1.bti')
                .text();
            const itemPicUrl = $(item)
                .find('div.fl img')
                .attr('src');
            const href = $(item)
                .find('dt.fl a')
                .attr('href');
            const price = $(item)
                .find('dt.fl a i.fl')
                .text();
            const itemDetailurl = 'http://www.wineyun.com' + href;
            const single = {
                title: `${price} ${title}`,
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
                single.description = `<img src ="${itemPicUrl}"><br>` + $('div#htmlDetails').html();
            }
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '酒云网 | 最新闪购',
        link: url,
        item: resultItem,
        description: '酒云网 | 最新闪购商品',
    };
};
