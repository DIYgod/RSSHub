const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    'zh-cn': {
        'news-all': {
            id: '255',
            title: '最新',
        },
        news: {
            id: '256',
            title: '新闻',
        },
        notice: {
            id: '257',
            title: '公告',
        },
        activity: {
            id: '258',
            title: '活动',
        },
        link: 'https://sr.mihoyo.com/news',
    },
    'zh-tw': {
        'news-all': {
            id: '248',
            title: '最新',
        },
        news: {
            id: '249',
            title: '資訊',
        },
        notice: {
            id: '250',
            title: '公告',
        },
        activity: {
            id: '251',
            title: '活動',
        },
        link: 'https://hsr.hoyoverse.com/zh-tw/news',
    },
};

module.exports = async (ctx) => {
    // location 地区 category 类型
    const { location = 'zh-cn', category = 'news-all' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
    let url = '';
    if (location === 'zh-cn') {
        url = `https://api-takumi-static.mihoyo.com/content_v2_user/app/1963de8dc19e461c/getContentList?iPage=1&iPageSize=${limit}&sLangKey=zh-cn&isPreview=0&iChanId=${categories[location][category].id}`;
    } else {
        url = `https://api-os-takumi-static.hoyoverse.com/content_v2_user/app/113fe6d3b4514cdd/getContentList?iPage=1&iPageSize=${limit}&sLangKey=${location}&isPreview=0&iChanId=${categories[location][category].id}`;
    }

    const response = await got(url);
    const list = response.data.data.list;
    const items = list.map((item) => ({
        title: item.sTitle,
        description: item.sContent,
        link: `${categories[location].link}/${item.iInfoId}`,
        pubDate: parseDate(item.dtStartTime),
        category: item.sCategoryName,
    }));

    ctx.state.data = {
        title: `${categories[location][category].title}-崩坏：星穹铁道`,
        link: url,
        item: items,
    };
};
