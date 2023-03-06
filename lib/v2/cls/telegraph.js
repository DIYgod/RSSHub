const got = require('@/utils/got');
const { app, os, sv, getSignedSearchParams } = require('./utils');
const { art } = require('@/utils/render');
const path = require('path');

const titles = {
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
    const category = ctx.params.category || '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const searchParams = getSignedSearchParams({
        app,
        category,
        hasFirstVipArticle: 1,
        os,
        rn: limit,
        sv,
    });
    let link = 'https://www.cls.cn/nodeapi/updateTelegraphList';
    if (category) {
        link = 'https://www.cls.cn/v1/roll/get_roll_list';
    }
    const response = await got({
        method: 'get',
        url: link,
        searchParams,
    });

    const list = response.data.data.roll_data.map((item) => ({
        title: item.title || item.content,
        link: item.shareurl,
        description: art(path.join(__dirname, 'templates/telegraph.art'), { item }),
        pubDate: new Date(item.ctime * 1000).toUTCString(),
        category: item.subjects?.map((s) => s.subject_name),
    }));

    ctx.state.data = {
        title: `财联社 - 电报${category === '' ? '' : ` - ${titles[category]}`}`,
        link: 'https://www.cls.cn/telegraph',
        item: list,
    };
};
