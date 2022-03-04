const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'xwgg';

    const rootUrl = 'https://yan.sicau.edu.cn';
    const currentUrl = `${rootUrl}/index/${category}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list-4 a[title]')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href').replace(/\.\./, '/')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.v_news_content').html();
                    item.pubDate = timezone(parseDate(detailResponse.data.match(/发布时间: (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)[1], 'YYYY-MM-DD HH:mm:ss'), +8);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
