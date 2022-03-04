const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const { category, type } = ctx.params;

    let id = '';
    let name = '';
    let url = 'recommended';
    const idResponse = await got({
        method: 'get',
        url: 'https://api.juejin.cn/tag_api/v1/query_category_briefs',
    });
    const cat = idResponse.data.data.find((item) => item.category_url === category);
    if (cat) {
        id = cat.category_id;
        name = cat.category_name;
        url = cat.category_url;
    }

    const params = {
        monthly: {
            period: 'month',
            title: '本月',
            link: 'monthly_hottest',
            sort_type: 30,
        },
        weekly: {
            period: 'week',
            title: '本周',
            link: 'weekly_hottest',
            url: 'get_entry_by_period',
            sort_type: 7,
        },
        historical: {
            period: '',
            title: '历史',
            link: 'hottest',
            sort_type: 0,
        },
    };

    const p = params[type];

    const title = `掘金${name}${p.title}最热`;
    const link = `https://juejin.im/${url}?sort=${p.link}`;

    let getUrl = 'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed';
    const getJson = {
        cursor: '0',
        id_type: 2,
        limit: 20,
        sort_type: p.sort_type,
    };

    if (url !== 'recommended') {
        getUrl = 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed';
        getJson.cate_id = id;
    }

    const trendingResponse = await got({
        method: 'post',
        url: getUrl,
        json: getJson,
    });
    let entrylist = trendingResponse.data.data;

    if (category === 'all' || category === 'devops' || category === 'product' || category === 'design') {
        entrylist = trendingResponse.data.data.filter((item) => item.item_type === 2).map((item) => item.item_info);
    }

    const resultItems = await util.ProcessFeed(entrylist, ctx.cache);

    ctx.state.data = {
        title,
        link,
        item: resultItems,
    };
};
