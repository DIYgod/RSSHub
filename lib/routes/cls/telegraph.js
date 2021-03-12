const got = require('@/utils/got');

const titles = {
    watch: '看盘',
    announcement: '公告',
    explain: '解读',
    red: '加红',
    jpush: '推送',
    remind: '提醒',
    fund: '基金',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const link = `https://www.cls.cn/nodeapi/updateTelegraphList?app=CailianpressWeb&category=${category}&hasFirstVipArticle=1&rn=30`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.data.roll_data.map((item) => ({
        title: item.title || item.content,
        link: item.shareurl,
        description: item.content,
        pubDate: new Date(item.ctime * 1000).toUTCString(),
    }));

    ctx.state.data = {
        title: `财联社 - 电报${category === '' ? '' : ` - ${titles[category]}`}`,
        link: 'https://www.cls.cn/telegraph',
        item: list,
    };
};
