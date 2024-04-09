const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.chsi.com.cn';

module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const response = await got(`${host}/kyzx/${type}`);
    const $ = cheerio.load(response.data);
    const typeName = $('.bread-nav .location a').last().text() || '考研资讯';
    const list = $('ul.news-list').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('.span-time').text();
            const path = item.find('a').attr('href');
            let itemUrl = '';
            if (path.startsWith('http')) {
                itemUrl = path;
            } else {
                itemUrl = host + path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (itemUrl) {
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
        title: `中国研究生招生信息网 - ${typeName}`,
        link: `${host}/kyzx/${type}/`,
        description: `中国研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
