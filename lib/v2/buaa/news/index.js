const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://news.buaa.edu.cn';
    const { type } = ctx.params;

    const { data: response, url: link } = await got(`${baseUrl}/${type}.htm`);

    const $ = cheerio.load(response);
    const title = $('.subnav span').text().trim();
    const list = $('.mainleft > .listlefttop > .listleftop1')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h2 > a');
            return {
                title: title.text(),
                link: new URL(title.attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('h2 em').text(), '[YYYY-MM-DD]'), +8),
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.description = $('.v_news_content').html();
                item.author = $('.vsbcontent_end').text().trim();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `北航新闻 - ${title}`,
        link,
        description: `北京航空航天大学新闻网 - ${title}`,
        item: result,
    };
};
