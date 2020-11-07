const got = require('@/utils/got');

const config = {
    latest: {
        zh_CN: '10',
        zh_TW: '87',
    },
    news: {
        zh_CN: '11',
        zh_TW: '90',
    },
    notice: {
        zh_CN: '12',
        zh_TW: '91',
    },
    activity: {
        zh_CN: '258',
        zh_TW: '92',
    },
};

const titles = {
    latest: {
        zh_CN: '最新',
        zh_TW: '最新',
    },
    news: {
        zh_CN: '新闻',
        zh_TW: '資訊',
    },
    notice: {
        zh_CN: '公告',
        zh_TW: '公告',
    },
    activity: {
        zh_CN: '活动',
        zh_TW: '活動',
    },
};

module.exports = async (ctx) => {
    ctx.params.location = ctx.params.location || 'zh_CN';
    ctx.params.category = ctx.params.category || 'latest';

    let rootUrl;

    if (ctx.params.location === 'zh_CN') {
        rootUrl = `https://ys.mihoyo.com/content/ysCn/getContentList?pageSize=5&pageNum=1&channelId=${config[ctx.params.category][ctx.params.location]}`;
    } else {
        rootUrl = `https://genshin.mihoyo.com/content/yuanshen/getContentList?pageSize=5&pageNum=1&channelId=${config[ctx.params.category][ctx.params.location]}`;
    }

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const list = response.data.data.list.map((item) => ({
        title: item.title,
        link: `https://ys.mihoyo.com/main/news/detail/${item.id}`,
        pubDate: new Date(item.start_time + ' GMT+8').toUTCString(),
        author: item.author,
    }));

    ctx.state.data = {
        title: `${titles[ctx.params.category][ctx.params.location]} - 原神`,
        link: rootUrl,
        item: list,
    };
};
