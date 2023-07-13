const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data } = await got(`https://zone.huoxian.cn/api/discussions?sort=-createdAt`);
    const items = data.data.map((item) => ({
        title: item.attributes.title,
        link: `https://zone.huoxian.cn/d/${item.attributes.slug}`,
        description: item.attributes.title,
        pubDate: parseDate(item.attributes.createdAt),
    }));
    ctx.state.data = {
        title: '火线 Zone-安全攻防社区',
        link: 'https://zone.huoxian.cn/',
        item: items,
    };
};
