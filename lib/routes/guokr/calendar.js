const got = require('@/utils/got');

async function loadFullPage(id) {
    const res = await got.get(`https://apis.guokr.com/minisite/article/${id}.json`);
    const content = res.data.result.content;
    return content;
}

module.exports = async (ctx) => {
    const response = await got.get('https://www.guokr.com/calendar');

    const rule = /(?<=<script>\s*window\.INITIAL_STORE=)[\s\S]*?(?=<\/script>)/g; // 在某个script标签下可以找到文章信息
    const data = JSON.parse(rule.exec(response.data)[0]);
    const items = data.calendarArticleListStore.articleList;
    items.pop(); // remove ad

    const result = await Promise.all(
        items.map(async (item) => ({
            title: item.title,
            description: await loadFullPage(item.id), // Mercury 无法正确解析全文，故这里手动加载
            pubDate: item.date_published,
            link: item.url,
        }))
    );

    ctx.state.data = {
        title: '果壳网 物种日历',
        link: 'https://www.guokr.com/calendar',
        description: '果壳网 物种日历',
        item: result,
    };
};
