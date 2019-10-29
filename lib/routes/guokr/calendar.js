const got = require('@/utils/got');

async function loadFullPage(ctx, id) {
    const link = `https://apis.guokr.com/minisite/article/${id}.json`;
    const content = await ctx.cache.tryGet(link, async () => {
        const res = await got.get(link);
        return res.data.result.content;
    });
    return content;
}

const categoryMap = {
    calendar: '物种日历',
    institute: '吃货研究所',
    beauty: '美丽也是技术活',
};

module.exports = async (ctx) => {
    const category = ctx.params.category;
    if (categoryMap[category] === undefined) {
        throw new Error(`Unknown category ${category}`);
    }

    const response = await got.get(`https://www.guokr.com/${category}`);

    const rule = /(?<=<script>\s*window\.INITIAL_STORE=)[\s\S]*?(?=<\/script>)/g; // 在某个script标签下可以找到文章信息
    const data = JSON.parse(rule.exec(response.data)[0]);
    const items = data[`${category}ArticleListStore`].articleList;

    const result = await Promise.all(
        items.map(async (item) => ({
            title: item.title,
            description: await loadFullPage(ctx, item.id), // Mercury 无法正确解析全文，故这里手动加载
            pubDate: item.date_published,
            link: item.url,
            author: item.external_author.nickname,
        }))
    );

    ctx.state.data = {
        title: `果壳网 ${categoryMap[category]}`,
        link: 'https://www.guokr.com/calendar',
        description: `果壳网 ${categoryMap[category]}`,
        item: result,
    };
};
