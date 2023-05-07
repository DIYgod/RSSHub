const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    '255': '最新',
    '256': '新闻',
    '257': '公告',
    '258': '活动'
};

module.exports = async (ctx) => {
    // category 类型
    const { category = '255' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
    const url = `https://api-takumi-static.mihoyo.com/content_v2_user/app/1963de8dc19e461c/getContentList?iPage=1&iPageSize=${limit}&sLangKey=zh-cn&isPreview=0&iChanId=${category}`;

    const response = await got(url);
    const list = response.data.data.list;
    const items = list.map((item) => ({
            title: item.sTitle,
            description: item.sContent,
            link: `https://sr.mihoyo.com/news/${item.iInfoId}`,
            pubDate: parseDate(item.dtStartTime),
            category: item.sCategoryName
        }));

    ctx.state.data = {
        title: `${categories[category]}-崩坏：星穹铁道`,
        link: url,
        item: items,
    };
};