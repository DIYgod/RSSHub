const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://kuwaitlocal.com';
    const { category = 'latest' } = ctx.params;
    const url = `${baseUrl}/news/${category === 'latest' ? category : `categories/${category}`}`;

    const { data: response } = await got(url);
    const $ = cheerio.load(response);
    const list = $('a.ggrid')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.txt').text().trim(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.pubDate = parseDate($('.single_news_meta span').eq(0).text().trim());
                item.category = $('.tags .tag')
                    .toArray()
                    .map((item) => $(item).text().trim());
                $('[id^=div-gpt-ad]').remove();
                $('.tags_sec2, .tags_sec, .comment').remove();
                item.description = $('.single_news_img').html() + $('#news_description').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        description: $('head meta[name="description"]').attr('content').trim(),
        link: url,
        item: items,
        language: 'en',
    };
};
