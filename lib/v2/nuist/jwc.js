const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseTitle = '南京信息工程大学-教务处';
const baseUrl = 'https://jwc.nuist.edu.cn';

module.exports = async (ctx) => {
    const { category = 'jxyw' } = ctx.params;
    const link = `${baseUrl}/${category === 'jxyw' || category === 'xyjx' ? 'index' : 'xxtz'}/${category}.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.main_list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').contents().first().text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.date').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.description = $('#vsb_content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: baseTitle + '：' + $('.dqwz').find('a').eq(1).text(),
        link,
        item: items,
    };
};
