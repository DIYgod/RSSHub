const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const config = {
    latest: 'list-35b3413e4c03411d8f3726162570804f',
    stories: 'list-7224ef82da1b498eb24046a6c56ff566',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'latest';

    const rootUrl = 'http://www.wp-china.com';
    const currentUrl = `${rootUrl}/f/${config[category]}.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.new_list')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.children('.fb').text(),
                link: `${rootUrl}${item.parent().attr('href')}`,
                pubDate: timezone(parseDate(item.children('.grey').text()), +8),
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

                    item.description = content('.wb100').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace(' - Powered By gobestsoft', ''),
        link: currentUrl,
        item: items,
    };
};
