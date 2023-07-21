// Warning: The author still knows nothing about javascript!

// params:
// type: notification type

const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const getArticle = require('./_article');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://sse.tongji.edu.cn';
    const type = ctx.params.type || 'xytz';
    const subType = ['bkstz', 'yjstz', 'jgtz', 'qttz'];

    const listUrl = `${baseUrl}/xxzx/${subType.includes(type) ? `xytz/${type}` : type}.htm`;
    const response = await got({
        method: 'get',
        url: listUrl,
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    // get urls
    const detailUrls = $('.data-list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.data-list-time').text(), 'YYYY-MM-DD'),
            };
        });

    // get articles
    const articleList = await Promise.all(detailUrls.map((item) => ctx.cache.tryGet(item.link, () => getArticle(item))));

    // feed the data
    ctx.state.data = {
        title: '同济大学软件学院',
        link: listUrl,
        item: articleList,
    };
};
