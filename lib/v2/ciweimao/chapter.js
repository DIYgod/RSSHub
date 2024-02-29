const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = Number.parseInt(ctx.query.limit) || 10;

    const baseUrl = 'https://wap.ciweimao.com';
    const chapterUrl = 'https://mip.ciweimao.com';

    const { data: response } = await got(`${baseUrl}/book/${id}`);
    const $ = cheerio.load(response);

    const firstChapterUrl = $('ul.catalogue-list li a').attr('href');
    const firstChapterId = firstChapterUrl.substring(firstChapterUrl.lastIndexOf('/') + 1);

    const { data: chapters } = await got(`${chapterUrl}/chapter/${id}/${firstChapterId}`);
    const $c = cheerio.load(chapters);

    const list = $c('ul.book-chapter li a')
        .slice(-limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                chapterLocked: item.find('h3 i.icon-lock').length > 0,
                title: item.find('h3').text(),
                pubDate: timezone(parseDate(item.find('p').text().replace('发布于 ', '')), +8),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.chapterLocked) {
                    return item;
                }
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const content = $('div.read-bd');
                content.find('span, a').remove();
                content.find('p').removeAttr('class');
                item.description = content.html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `刺猬猫 ${$('.book-name').text()}`,
        link: `${baseUrl}/book/${id}`,
        description: $('.book-desc div p').text(),
        image: $('meta[name=image]').attr('content'),
        item: items,
    };
};
