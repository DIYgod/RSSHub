const { getData, getList } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://web.stockedge.com/daily-updates?section=news';
    const apiPath = 'https://api.stockedge.com/Api/DailyDashboardApi/GetLatestNewsItems';
    const apiInfo = 'https://api.stockedge.com/Api/SecurityDashboardApi/GetSecurityOverview';

    const data = await getData(apiPath);
    const list = getList(data);
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const info = await getData(`${apiInfo}/${item.securityID}`);
                item.description = item.description + '<br><br>' + info?.AboutCompanyText;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Stock Edge',
        link: baseUrl,
        item: items,
        description: 'Daily Updates on stockedge.com',
        logo: 'https://web.stockedge.com/assets/icon/favicon.png',
        icon: 'https://web.stockedge.com/assets/img/light/icon.png',
        language: 'en-us',
    };
};
