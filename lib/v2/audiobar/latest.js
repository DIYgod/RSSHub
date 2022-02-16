const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'http://www.audiobar.cn/';

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/all.php`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    const list = $('.thread_every_container_div')
        .map((_, item) => {
            item = $(item);

            const link = item.find('.thread_subject').attr('href');
            const dateStr = item.find('.atrd_span').text().slice(-26).replace(' ', '');
            return {
                title: item.find('.thread_subject').text().replace('\n', '').replace(' ', ''),
                link: link.indexOf('http') > -1 ? link : `${rootUrl}${link}`,
                pubDate: timezone(parseDate(dateStr, 'YY-M-D HH:mm'), +8),
            };
        })
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });
                const detailResponsedata = iconv.decode(detailResponse.data, 'gb2312');
                const content = cheerio.load(detailResponsedata);
                item.description = content('.zhengwen_div').text().replace('Your browser does not support HTML5, please change another browser.', '');
                return item;
            })
        )
    );
    ctx.state.data = {
        title: '音频应用-最新主题',
        link: currentUrl,
        item: items,
    };
};
