const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const rootUrl = 'https://zsjyc.ncst.edu.cn';
    const currentUrl = `${rootUrl}/col/1589245326769/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    const list = $('.lmnr div')
        .map((_, item) => {
            item = $(item);
            const link = item.find('a').attr('href');
            if (link) {
                const dateStr = item.find('div[style="float:right;font-size:14px;color:#9a9797;padding-right:10px;"]').text() + ' GMT+0800'; // Append timezone
                const date = new Date(dateStr);
                return {
                    title: item.find('a').text(),
                    link: new URL(link, rootUrl).href,
                    pubDate: date.toUTCString(),
                };
            } else {
                return null; // Return null when no link is found
            }
        })
        .get()
        .filter((item) => item !== null); // Remove null items

    ctx.state.data = {
        title: `华北理工大学招生就业处 - 最新资讯`,
        link: currentUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });

                    const content = cheerio.load(iconv.decode(detailResponse.data, 'gb2312'));

                    item.description = content('#conN').html();

                    return item;
                })
            )
        ),
    };
};
