const axios = require('../../utils/axios');

const axios_ins = axios.create({
    responseType: 'json',
});

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const type = ctx.params.type;

    let id = 'all';
    let name = '';

    // 数据来源：https://gold-tag-ms.juejin.im/v1/categories
    switch (category) {
        case 'android':
            id = '5562b410e4b00c57d9b94a92';
            name = 'Android';
            break;
        case 'frontend':
            id = '5562b415e4b00c57d9b94ac8';
            name = '前端';
            break;
        case 'ios':
            id = '5562b405e4b00c57d9b94a41';
            name = 'iOS';
            break;
        case 'product':
            id = '569cbe0460b23e90721dff38';
            name = '产品';
            break;
        case 'design':
            id = '5562b41de4b00c57d9b94b0f';
            name = '设计';
            break;
        case 'freebie':
            id = '5562b422e4b00c57d9b94b53';
            name = '工具资源';
            break;
        case 'article':
            id = '5562b428e4b00c57d9b94b9d';
            name = '阅读';
            break;
        case 'backend':
            id = '5562b419e4b00c57d9b94ae2';
            name = '后端';
            break;
        case 'ai':
            id = '57be7c18128fe1005fa902de';
            name = '人工智能';
            break;
        case 'devops':
            id = '5b34a478e1382338991dd3c1';
            name = '运维';
            break;
        default:
            break;
    }

    const host = 'https://timeline-merger-ms.juejin.im/v1';
    const limit = 'src=web&limit=20'; // 返回最新20条数据

    let link = 'https://juejin.im/timeline/?sort=';
    let title;
    let url;

    if (type === 'monthly') {
        title = `掘金${name}本月最热`;
        link += 'monthlyHottest';
        url = `${host}/get_entry_by_period?period=${type.slice(0, -2)}&${limit}&category=${id}`;
    } else if (type === 'weekly') {
        title = `掘金${name}本周最热`;
        link += 'weeklyHottest';
        url = `${host}/get_entry_by_period?period=${type.slice(0, -2)}&${limit}&category=${id}`;
    } else {
        title = `掘金${name}历史最热`;
        link += 'hottest';
        url = `${host}/get_entry_by_hot?${limit}&category=${id}`;
    }

    const trendingResponse = await axios_ins.get(url);
    const entrylist = trendingResponse.data.d.entrylist;

    const resultItems = await Promise.all(
        entrylist.map(async (item) => {
            const resultItem = {
                title: item.title,
                link: item.originalUrl,
                description: item.summaryInfo,
                pubDate: item.updatedAt,
            };
            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: title,
        link: link,
        item: resultItems,
    };
};
