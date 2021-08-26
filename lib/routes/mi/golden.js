const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://app.market.xiaomi.com/apm/subject/169449?os=1.1.1&sdk=19';
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.listApp.map((item) => ({
        title: `第${item.subjectGroup.split('期')[0].replace('第', '')}期 ${item.displayName} [${item.level1CategoryName} - ${item.level2CategoryName}]`,
        link: `http://app.mi.com/details?id=${item.packageName}`,
        description: item.briefShow,
    }));

    ctx.state.data = {
        title: `金米奖 - 小米应用商店`,
        link,
        item: list,
        description: `${response.data.description}`,
    };
};
