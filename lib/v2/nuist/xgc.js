const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseTitle = '南信大学生工作处';
const baseUrl = 'https://xgc.nuist.edu.cn';

module.exports = async (ctx) => {
    const link = baseUrl + '/419/list.htm';

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.wp_article_list .list_item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.Article_PublishDate').text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    const articleInfo = $('.arti_metas');

                    item.author = articleInfo.find('.arti_publisher').text().replace('作者：', '');
                    item.description = $('.entry').html();
                } catch (e) {
                    // intranet
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: baseTitle,
        link,
        item: items.filter((x) => x),
    };
};
