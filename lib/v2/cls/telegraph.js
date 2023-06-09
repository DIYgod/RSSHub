const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { rootUrl, getSearchParams } = require('./utils');

const categories = {
    watch: '看盘',
    announcement: '公司',
    explain: '解读',
    red: '加红',
    jpush: '推送',
    remind: '提醒',
    fund: '基金',
    hk: '港股',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    let apiUrl = `${rootUrl}/nodeapi/updateTelegraphList`;
    if (category) {
        apiUrl = `${rootUrl}/v1/roll/get_roll_list`;
    }

    const currentUrl = `${rootUrl}/telegraph`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: getSearchParams({
            category,
            hasFirstVipArticle: 1,
        }),
    });

    const items = response.data.data.roll_data.slice(0, limit).map((item) => ({
        title: item.title || item.content,
        link: item.shareurl,
        description: art(path.join(__dirname, 'templates/telegraph.art'), {
            item,
        }),
        pubDate: parseDate(item.ctime * 1000),
        category: item.subjects?.map((s) => s.subject_name),
    }));

    ctx.state.data = {
        title: `财联社 - 电报${category === '' ? '' : ` - ${categories[category]}`}`,
        link: currentUrl,
        item: items,
    };
};
