const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://roll.caijing.com.cn';
    const response = await got(`${baseUrl}/ajax_lists.php`, {
        searchParams: {
            modelid: 0,
            time: Math.random(),
        },
    });

    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url.replace('http://', 'https://'),
        pubDate: timezone(parseDate(item.published, 'MM-DD HH:mm'), +8),
        category: item.cat,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.author = $('.editor').text().trim() || $('#editor_baidu').text().trim().replace(/[()]/g, '');
                item.description = $('.article-content').html();
                item.category = [
                    item.category,
                    ...$('.news_keywords span')
                        .toArray()
                        .map((e) => $(e).text()),
                ];
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '滚动新闻-财经网',
        image: 'https://www.caijing.com.cn/favicon.ico',
        link: response.url,
        item: items,
    };
};
