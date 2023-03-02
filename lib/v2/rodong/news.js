const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.rodong.rep.kp';

module.exports = async (ctx) => {
    const { language = 'ko' } = ctx.params;
    const link = `${host}/${language}/index.php?MkBAMkAxQA==`;
    const { data: response } = await got(link);

    const $ = cheerio.load(response);
    const list = $('.date_news_list .row')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.media-body').text(),
                link: `${host}/${language}/${item.find('.media-body a').attr('href')}`,
                author: item.find('.col-sm-3').text(),
                pubDate: parseDate(item.find('.news_date').text(), 'YYYY.M.D.'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('.news_Title, .NewsDetail, .News_Detail, #moveNews').remove();
                item.description = $('.col-sm-8').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    };
};
