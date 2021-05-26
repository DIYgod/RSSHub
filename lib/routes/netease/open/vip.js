const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://vip.open.163.com';

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.CourseListItem_ListItem')
        .map((index, ele) => {
            $('.CourseListItem_oriPrice', ele).remove();
            const price = $('.CourseListItem_price', ele).text().trim();
            return {
                title: price + ' - ' + $('.CourseListItem_title', ele).text(),
                link: url + $(ele).attr('href'),
            };
        })
        .get();

    const item = await Promise.all(
        list.slice(0, 10).map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                const s = cheerio.load(res.data);
                s('img').css('max-width', '100%');
                const toc = s('.CourseCommonDetail_contentItem').eq(1).html();
                item.description = `<div style="text-align: center;">${toc}` + s('.CourseCommonDetail_contentItem').first().html() + `</div>`;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '网易公开课 - 精品课程',
        link: url,
        item,
    };
};
