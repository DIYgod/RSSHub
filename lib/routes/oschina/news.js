const url = require('url');
const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0';

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
    const category = ctx.params.category || 'all';
    const config = configs[category];

    const res = await got({
        method: 'get',
        url: config.ajaxUrl,
        headers: {
            'User-Agent': USER_AGENT,
            Referer: config.link,
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const $ = cheerio.load(res.data);
    $('.ad-wrap').remove();
    const list = $('.items').find('.news-item');
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const originalUrl = each.find('a', 'h3').attr('href');
            const item = {
                title: each.find('a', 'h3').attr('title'),
                description: each.find('p', '.description').text(),
                link: url.resolve('https://www.oschina.net', encodeURI(originalUrl)),
                pubDate: date(each.find('.extra > .list > .item:nth-of-type(2)').text()),
            };
            if (/^https?:\/\/www.oschina.net\/news\/.*$/.test(originalUrl)) {
                const key = 'oschina' + item.link;
                const value = await ctx.cache.get(key);

                if (value) {
                    item.description = value;
                } else {
                    const detail = await got({
                        method: 'get',
                        url: item.link,
                        headers: {
                            'User-Agent': USER_AGENT,
                            Referer: config.link,
                        },
                    });
                    const content = cheerio.load(detail.data);
                    content('.ad-wrap').remove();
                    item.description = content('.article-detail').html();
                    item.author = content('.article-box__meta .item').first().text();
                    ctx.cache.set(key, item.description);
                }
            }
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `开源中国-${config.name}`,
        link: config.link,
        item: resultItem,
    };
};
