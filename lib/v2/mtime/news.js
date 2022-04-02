const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'http://news.mtime.com/';
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.left-cont.fix li')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h4 a').text(),
                link: item.find('h4 a').attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('.DRE-subject-wrapper').remove();

                item.author = content('.editor').text().replace('编辑：', '');
                item.description = content('.body').first().html();
                item.pubDate = timezone(parseDate(content('.userCreateTime').text()), 8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Mtime时光网 - 资讯',
        link,
        item: items,
    };
};
