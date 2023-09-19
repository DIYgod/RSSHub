const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // Define the categories and titles
    const categories = {
        xxxw: '学校新闻',
        tzgg: '通知公告',
        xsdt: '学术动态',
        ybfc: '院部风采',
    };

    // Get the category from the query string
    const category = ctx.params.category || 'xxxw';

    // Define the base URL
    const rootUrl = 'https://www.hnuahe.edu.cn';

    // Get the page content
    const response = await got.get(`${rootUrl}/index/${category}.htm`);
    const $ = cheerio.load(response.data);

    // Parse the news items
    const items = await Promise.all(
        $('table.winstyle45571 tr')
            .slice(0, 10)
            .map(async (_, item) => {
                item = $(item);

                // Extract the data from the HTML
                const title = item.find('a.c45571').attr('title');
                const link = new URL(item.find('a.c45571').attr('href'), rootUrl).href;
                const pubDate = parseDate(item.find('.timestyle45571').text().trim(), 'YYYY-MM-DD');

                // Get the full news item
                const cache = await ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got.get(link);
                    const detail$ = cheerio.load(detailResponse.data);

                    // Extract the description
                    const description = detail$('.contentstyle45572').html();

                    return {
                        title,
                        link,
                        pubDate,
                        description,
                    };
                });

                return cache;
            })
            .get()
    );

    // Generate the RSS feed
    ctx.state.data = {
        title: `${categories[category]} - 河南牧业经济学院`,
        link: `${rootUrl}/index/${category}.htm`,
        item: items,
    };
};
