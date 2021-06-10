const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category || '0';

    const id = parseInt(category);
    const isNumber = !isNaN(id);

    const rootUrl = 'https://fjksbm.com';
    const currentUrl = `${rootUrl}/portal${isNumber ? '' : `/${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = (isNumber ? $('.panel-body').eq(id).find('.examName a') : $('.panel-body ul li a'))
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.indexOf('//') < 0 ? `${rootUrl}${link}/news/bulletin` : link.indexOf('https') < 0 ? `https:${link}` : link,
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

                    content('h3').remove();
                    content('.panel-body div').eq(0).remove();

                    item.description = content('.panel-body').html();
                    item.pubDate = timezone(new Date(detailResponse.data.match(/发布时间：(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]), +8);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('.panel-heading')
            .eq(isNumber ? id : 1)
            .text()} - 福建考试报名网`,
        link: currentUrl,
        item: items,
    };
};
