const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

const nodes = {
    china_news: {
        title: '中国',
        url: 'http://china.cankaoxiaoxi.com/',
    },
    world_news: {
        title: '国际',
        url: 'http://world.cankaoxiaoxi.com/',
    },
    military_news: {
        title: '军事',
        url: 'http://mil.cankaoxiaoxi.com/',
    },
    taiwan_news: {
        title: '台海',
        url: 'http://tw.cankaoxiaoxi.com/',
    },
    finance_news: {
        title: '财经',
        url: 'http://finance.cankaoxiaoxi.com/',
    },
    technology_news: {
        title: '科技',
        url: 'http://science.cankaoxiaoxi.com/',
    },
    culture_news: {
        title: '文化',
        url: 'http://culture.cankaoxiaoxi.com/',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category;
    // console.log(nodes[category]['url']);

    const currentUrl = nodes[category].url;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    // eslint-disable-next-line array-callback-return
    const list = $('a', '.toutiao')
        // eslint-disable-next-line array-callback-return
        .map((_, item) => {
            item = $(item);
            if (item.text() !== '') {
                return {
                    link: item.attr('href'),
                };
            }
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                item.title = content('h1.articleHead').text();
                item.pubDate = timezone(parseDate(content('span#pubtime_baidu').text()), +8);
                item.author = content('span#source_baidu').text();
                item.description = content('div.articleText').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${nodes[category].title} 参考消息`,
        link: currentUrl,
        description: '参考消息',
        language: 'zh-cn',
        item: items,
    };
};
