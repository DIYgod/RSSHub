const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

const HOST = 'https://www.51voa.com';
const PAGE_ROUTER = {
    standard: {
        url: 'https://www.51voa.com/VOA_Standard_1.html',
        title: '常速英语',
    },
    archive: {
        url: 'https://www.51voa.com/VOA_Standard_1_archiver.html',
        title: '常速英语存档',
    },

    technology: {
        url: 'https://www.51voa.com/Technology_Report_1.html',
        title: '科技报道',
    },
    daily: {
        url: 'https://www.51voa.com/This_is_America_1.html',
        title: '今日美国',
    },
    sciences: {
        url: 'https://www.51voa.com/Science_in_the_News_1.html',
        title: '科学报道',
    },
    health: {
        url: 'https://www.51voa.com/Health_Report_1.html',
        title: '健康报道',
    },
    education: {
        url: 'https://www.51voa.com/Education_Report_1.html',
        title: '教育报道',
    },
    economics: {
        url: 'https://www.51voa.com/Economics_Report_1.html',
        title: '经济报道',
    },
    culture: {
        url: 'https://www.51voa.com/American_Mosaic_1.html',
        title: '文化艺术',
    },
    events: {
        url: 'https://www.51voa.com/In_the_News_1.html',
        title: '时事新闻',
    },
    stories: {
        url: 'https://www.51voa.com/American_Stories_1.html',
        title: '美国故事',
    },
    words: {
        url: 'https://www.51voa.com/Words_And_Their_Stories_1.html',
        title: '词汇掌故',
    },
    trending: {
        url: 'https://www.51voa.com/Trending_Today_1.html',
        title: '今日热点',
    },
    magazine: {
        url: 'https://www.51voa.com/as_it_is_1.html',
        title: '新闻杂志',
    },
    grammar: {
        url: 'https://www.51voa.com/Everyday_Grammar_1.html',
        title: '日常语法',
    },
    queries: {
        url: 'https://www.51voa.com/ask_a_teacher_1.html',
        title: '名师答疑',
    },
    history: {
        url: 'https://www.51voa.com/The_Making_of_a_Nation_1.html',
        title: '美国历史',
    },
    park: {
        url: 'https://www.51voa.com/National_Parks_1.html',
        title: '国家公园',
    },
    president: {
        url: 'https://www.51voa.com/Americas_Presidents_1.html',
        title: '美国总统',
    },
    agriculture: {
        url: 'https://www.51voa.com/Agriculture_Report_1.html',
        title: '农业报道',
    },
    exploration: {
        url: 'https://www.51voa.com/Explorations_1.html',
        title: '自然探索',
    },
    people: {
        url: 'https://www.51voa.com/People_in_America_1.html',
        title: '美国人物',
    },
    bilingual: {
        url: 'https://www.51voa.com/Bilingual_News_1.html',
        title: '双语新闻',
    },
    address: {
        url: 'https://www.51voa.com/President_Address_1.html',
        title: '总统演讲',
    },
};

module.exports = async (ctx) => {
    const { channel } = ctx.params;
    const { url, title } = PAGE_ROUTER[channel] || {};

    const response = await got({
        method: 'get',
        url: url,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.List ul li>a')
        .slice(0, 5)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (link) => {
            const pageUrl = HOST + link;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: pageUrl,
                headers: {
                    Referer: url,
                },
            });

            const $ = cheerio.load(response.data);

            const single = {
                pubDate: date($('div.Content>span.datetime').text()),
                link: $('div.title h1').text(),
                title: $('div.title>h1').html(),
                description: $('div.Content').html(),
                category: ['study', 'English'],
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: title,
        link: url,
        description: '51voa - ' + channel,
        item: out,
    };
};
