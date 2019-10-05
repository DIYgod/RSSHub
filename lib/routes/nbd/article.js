const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'http://www.nbd.com.cn/columns/332';
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://www.nbd.com.cn',
        },
    });

    const $ = cheerio.load(response.data);
    const $list = $('li.u-news-title')
        .slice(0, 15)
        .get();
    const description = $('head title')
        .text()
        .trim();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item)
                .find('a')
                .text()
                .trim();
            const pubDate = $(item)
                .find('span')
                .text()
                .trim();
            const link = $(item)
                .find('a')
                .attr('href');
            // global.console.log(title);
            global.console.log(link);

            const single = {
                title: title,
                link: link,
                pubDate: pubDate,
                description: '',
            };

            const detail = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: 'http://www.nbd.com.cn',
                },
            });

            {
                const $ = cheerio.load(detail.data);
                single.description = $('div.g-article').html();
            }
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '重磅原创-每经网 ',
        link: url,
        item: resultItem,
        description: description,
    };
};
