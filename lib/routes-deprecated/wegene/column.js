const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const name = type === 'all' ? '全部项目' : '专业版';
    const category = ctx.params.category;

    const link = 'https://www.wegene.com/crowdsourcing';
    const api = `https://www.wegene.com/crowdsourcing/ajax/get_list/?&htmlspecialchars_decode=true&type=${type}&page=1&limit=10&category=${category}&sort=NEW`;

    const response = await got.get(api);
    const data = response.data.rsm.list;

    ctx.state.data = {
        title: `${name}的${category}最近更新-WeGene`,
        link,
        item: data.map((item) => ({
            title: item.title,
            link: `https://www.wegene.com/crowdsourcing/details/${item.id}`,
            date: new Date(item.add_time * 1000).toUTCString(),
            author: item.user.user_name,
            description: item.description,
        })),
    };
};
