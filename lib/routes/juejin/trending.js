const got = require('@/utils/got');
const querystring = require('querystring');

const got_ins = got.extend({
    responseType: 'json',
    headers: { 'X-Juejin-Src': 'web' },
});

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const type = ctx.params.type;

    let id = 'all';
    let name = '';
    await got_ins.get('https://gold-tag-ms.juejin.im/v1/categories').then(function (response) {
        const [item] = response.data.d.categoryList.filter((item) => category.localeCompare(item.title) === 0);
        if (item !== undefined) {
            id = item.id;
            name = item.name;
        }
    });

    const params = {
        monthly: { period: 'month', title: '本月', link: 'monthlyHottest', url: 'get_entry_by_period' },
        weekly: { period: 'week', title: '本周', link: 'weeklyHottest', url: 'get_entry_by_period' },
        historical: { period: '', title: '历史', link: 'hottest', url: 'get_entry_by_hot' },
    };

    const p = params[type];
    const qs = querystring.stringify({
        src: 'web',
        limit: 20,
        period: p.period,
        category: id,
    });

    const title = `掘金${name}${p.title}最热`;
    const url = `https://timeline-merger-ms.juejin.im/v1/${p.url}?${qs}`;
    const link = `https://juejin.im/timeline/${id}?sort=${p.link}`;

    const trendingResponse = await got_ins.get(url);
    const entrylist = trendingResponse.data.d.entrylist;

    const resultItems = await Promise.all(
        entrylist.map(async (item) => {
            const resultItem = {
                title: item.title,
                link: item.originalUrl,
                description: item.summaryInfo,
                pubDate: item.createdAt,
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
