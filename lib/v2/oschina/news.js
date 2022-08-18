const got = require('@/utils/got');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

const configs = {
    all: {
        name: '最新资讯',
        link: 'https://www.oschina.net/news/project',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_all_list?p=1&type=ajax',
    },
    industry: {
        name: '综合资讯',
        link: 'https://www.oschina.net/news/industry',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_generic_list?p=1&type=ajax',
    },
    project: {
        name: '软件更新资讯',
        link: 'https://www.oschina.net/news/project',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_project_list?p=1&type=ajax',
    },
    'industry-news': {
        name: '行业资讯',
        link: 'https://www.oschina.net/news/industry-news',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_industry_list?p=1&type=ajax',
    },
    programming: {
        name: '编程语言资讯',
        link: 'https://www.oschina.net/news/programming',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_programming_language_list?p=1&type=ajax',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'all';
    const config = configs[category];

    const res = await got(config.ajaxUrl, {
        headers: {
            Referer: config.link,
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const $ = cheerio.load(res.data);

    const list = $('.items .news-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.extra > .list > .item:nth-of-type(2)').text();
            return {
                title: item.find('h3 a').attr('title'),
                description: item.find('.description p').text(),
                link: item.find('h3 a').attr('href'),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), +8),
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (/^https?:\/\/(my|www)\.oschina.net\/.*$/.test(item.link)) {
                    const detail = await got(item.link, {
                        headers: {
                            Referer: config.link,
                        },
                    });
                    const content = cheerio.load(detail.data);

                    item.description = content('.article-detail').html();
                    item.author = content('.article-box__meta .item').first().text();
                }
                if (/^https?:\/\/gitee.com\/.*$/.test(item.link)) {
                    const detail = await got(item.link, {
                        headers: {
                            Referer: config.link,
                        },
                    });
                    const content = cheerio.load(detail.data);

                    item.description = content('.file_content').html();
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `开源中国-${config.name}`,
        link: config.link,
        item: resultItem,
    };
};
