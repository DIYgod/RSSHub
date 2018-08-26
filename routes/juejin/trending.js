const axios = require('../../utils/axios');
const axios_ins = axios.create({
    responseType: 'json',
});

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const host = 'https://timeline-merger-ms.juejin.im/v1';
    const limit = 'src=web&limit=20&category=all';

    let title = '';
    let url = '';

    if (type === 'monthly') {
        title = '掘金 本月 最热';
        url = `${host}/get_entry_by_period?period=${type.slice(0, -2)}&${limit}`;
    } else if (type === 'weekly') {
        title = '掘金 本周 最热';
        url = `${host}/get_entry_by_period?period=${type.slice(0, -2)}&${limit}`;
    } else {
        title = '掘金 历史 最热';
        url = `${host}/get_entry_by_hot?${limit}`;
    }

    const trendingResponse = await axios_ins.get(url);

    const entrylist = trendingResponse.data.d.entrylist; // 返回最新20条数据

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
        link: 'https://juejin.im/timeline',
        item: resultItems,
    };
};
