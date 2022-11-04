const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const config = {
    latest: {
        main: '10',
        'zh-tw': '87',
    },
    news: {
        main: '11',
        'zh-tw': '90',
    },
    notice: {
        main: '12',
        'zh-tw': '91',
    },
    activity: {
        main: '258',
        'zh-tw': '92',
    },
};

const titles = {
    latest: {
        main: '最新',
        'zh-tw': '最新',
    },
    news: {
        main: '新闻',
        'zh-tw': '資訊',
    },
    notice: {
        main: '公告',
        'zh-tw': '公告',
    },
    activity: {
        main: '活动',
        'zh-tw': '活動',
    },
};

module.exports = async (ctx) => {
    const location = ctx.params.location ?? 'main';
    const category = ctx.params.category ?? 'latest';

    const is_zh_CN = location === 'main';

    const rootUrl = is_zh_CN
        ? `https://ys.mihoyo.com/content/ysCn/getContentList?pageSize=5&pageNum=1&channelId=${config[category][location]}`
        : `https://genshin.mihoyo.com/content/yuanshen/getContentList?pageSize=5&pageNum=1&channelId=${config[category][location]}`;

    const response = await got(rootUrl);

    const article_zh_CN = 'https://ys.mihoyo.com/main/news';
    const article_zh_TW = 'https://genshin.hoyoverse.com/zh-tw/news';

    const list = response.data.data.list.map((item) => ({
        title: item.title,
        link: is_zh_CN ? `${article_zh_CN}/detail/${item.id}` : `${article_zh_TW}/detail/${item.id}`,
        pubDate: timezone(parseDate(item.start_time), 8),
        author: item.author,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                item.description = JSON.parse(response.match(/,content:(".*?"),ext:\[\{/)[1]);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[category][location]} - 原神`,
        link: is_zh_CN ? `${article_zh_CN}/${config[category][location]}` : article_zh_TW,
        item: items,
    };
};
