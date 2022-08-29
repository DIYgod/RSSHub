const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://www.iresearch.com.cn';
    const currentUrl = `${rootUrl}/report.shtml?type=4`;
    const apiUrl = `${rootUrl}/api/json/report/ireport.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = JSON.parse(response.data.slice(1))
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 200)
        .filter((item) => (category ? item.classname === category : true))
        .map((item) => ({
            title: item.reportname,
            pubDate: parseDate(item.addtime),
            link: `${rootUrl}/report/detail?id=${item.id}`,
            category: [item.classname].concat(item.keywords.split(',')),
            description: art(path.join(__dirname, 'templates/weekly.art'), {
                id: item.id,
                cover: item.reportpic,
                content: item.shortcoutent,
                pages: item.PagesCount,
            }),
        }));

    ctx.state.data = {
        title: '艾瑞咨询 - 周度市场观察',
        link: currentUrl,
        item: items,
    };
};
