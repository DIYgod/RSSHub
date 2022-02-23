const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const link = `http://www.cpta.com.cn/GB/360339/index.html`;
    const response = await got({ method: 'get', url: link, responseType: 'buffer' });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const list = $('ul.list_14 li')
        .map((_, item) => {
            item = $(item).find('a');
            return {
                title: item.text(),
                link: url.resolve(`http://www.cpta.com.cn/`, item.attr('href')),
            };
        })
        .get();

    ctx.state.data = {
        title: '中国人事考试网 - 通知公告',
        link,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ method: 'get', url: item.link, responseType: 'buffer' });
                    const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));
                    item.description = content('div.text').html();
                    item.pubDate = new Date(
                        content('#p_publishtime')
                            .text()
                            .replace(/[年|月]/g, '-')
                            .replace(/日/g, ' ') + ' GMT+8'
                    ).toUTCString();
                    return item;
                })
            )
        ),
    };
};
