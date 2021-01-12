const got = require('@/utils/got');

const titles = {
    total: '全站',
    focus: '国际',
    science: '科学',
    car: '汽车',
    zvideo: '视频',
    fashion: '时尚',
    depth: '时事',
    digital: '数码',
    sport: '体育',
    school: '校园',
    film: '影视',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'total';

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/${category}?limit=50`,
    });

    const items = response.data.data.map((item) => ({
        link: item.target.url,
        title: item.target.title,
        pubDate: new Date(item.target.created * 1000).toUTCString(),
        description: item.target.excerpt ? `<p>${item.target.excerpt}</p>` : '',
    }));

    ctx.state.data = {
        title: `知乎热榜 - ${titles[category]}`,
        link: `https://www.zhihu.com/hot?list=${category}`,
        item: items,
    };
};
