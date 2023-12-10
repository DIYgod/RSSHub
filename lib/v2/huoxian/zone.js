const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data } = await got('https://zone.huoxian.cn/api/discussions?sort=-createdAt');
    const items = data.data.map((item) => ({
        title: item.attributes.title,
        link: `https://zone.huoxian.cn/d/${item.attributes.slug}`,
        description: data.included.find((i) => i.id === item.relationships.firstPost.data.id).attributes.contentHtml,
        pubDate: parseDate(item.attributes.createdAt),
        author: data.included.find((i) => i.id === item.relationships.user.data.id).attributes.displayName,
        category: data.included.filter((i) => item.relationships.tags.data.map((t) => t.id).includes(i.id) && i.type === 'tags').map((i) => i.attributes.name),
    }));
    ctx.state.data = {
        title: '火线 Zone-安全攻防社区',
        link: 'https://zone.huoxian.cn/',
        item: items,
    };
};
