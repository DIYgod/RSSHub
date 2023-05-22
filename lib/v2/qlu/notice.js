const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://www.qlu.edu.cn';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${host}/tzggsh/list1.htm`,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.news_list.list2').children();

    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('.news_title').children().text();
            const itemDate = item.find('.news_year').text() + item.find('.news_days').text();
            const path = item.find('.news_title').children().attr('href');
            let itemUrl = '';
            if (!path.startsWith('https://') && !path.startsWith('http://')) {
                itemUrl = host + path;
            } else {
                itemUrl = path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (!path.startsWith('https://') && !path.startsWith('http://')) {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    description = $('.read').html().trim();
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: `齐鲁工业大学 - 通知公告`,
        link: `${host}/tzggsh/list1.htm`,
        description: '齐鲁工业大学 - 通知公告',
        item: items,
    };
};
