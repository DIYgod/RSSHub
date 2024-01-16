const got = require('@/utils/got');

// 样例 链接 : https://weexcn.com/news/newest
const baseUrl = 'https://weexcn.com/news/';
// const api_url = 'https://api.jianyuweb.com/apiv1/content/articles?category=&limit=15&cursor=&platform=weex-platform';

const sizeTitle = 'WEEX--华尔街见闻旗下全球投资线上品牌';

// 数字标识, name 栏目名称, link: url, category: api cate
const map = new Map([
    ['1', { name: '最新文章', link: 'newest', category: '' }],
    ['2', { name: '市场要闻', link: 'important', category: 'weex-important' }],
    ['3', { name: '交易策略', link: 'strategy', category: 'weex-tradingstrategies' }],
    ['4', { name: '机构观点', link: 'opinion', category: 'weex-institutioncomments' }],
    ['5', { name: '投资学堂', link: 'education', category: 'weex-introduction' }],
    ['6', { name: '行业观察', link: 'industry', category: 'weex-industryanalysis' }],
    ['7', { name: '基金理财', link: 'money', category: 'weex-money' }],
    ['7', { name: '分析师投稿', link: 'analyst', category: 'weex-analyst' }],
]);

module.exports = async (ctx) => {
    // 默认 用户 id  Oak7mqnEQJ
    const type_id = ctx.params.typeid || '1';
    const type = map.get(type_id);

    const type_url = 'https://weexcn.com/news/' + type.link;
    const type_api_url = `https://api.jianyuweb.com/apiv1/content/articles?category=${type.category}&limit=15&cursor=&platform=weex-platform`;

    // 直接获取到 json 数据
    const response = await got({
        method: 'get',
        url: type_api_url,
        headers: {
            Referer: type_url,
        },
    });

    const json_data = response.data.data.items;

    const result = [];
    for (const item of json_data) {
        const title = item.title;
        const guid = item.id;
        const pubDate = new Date(item.display_time * 1000).toUTCString();

        // link 需要转换
        // https://wallstreetcn.com/articles/3587433
        // https://weexcn.com/articles/3587433
        const link = item.uri.replace(/wallstreetcn.com/, 'weexcn.com');
        const description = item.content_short;

        const single = {
            title,
            link,
            guid,
            pubDate,
            description,
        };

        result.push(single);
    }

    ctx.state.data = {
        title: type.name + '---' + sizeTitle,
        link: baseUrl + type.link,
        description: sizeTitle,
        item: result,
    };
};
