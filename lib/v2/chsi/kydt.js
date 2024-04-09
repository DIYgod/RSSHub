const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.chsi.com.cn';

module.exports = async (ctx) => {
    const response = await got(`${host}/kyzx/kydt`);

    const $ = cheerio.load(response.data);
    const list = $('ul.news-list').children();

    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('.span-time').text();
            const path = item.find('a').attr('href');
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
                    description = $('#article_dnull').html().trim();
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
        title: `中国研究生招生信息网 - 考研动态`,
        link: `${host}/kyzx/kydt/`,
        description: '中国研究生招生信息网 - 考研动态',
        item: items,
    };
};
