const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://www.wegene.com/';
    const api = 'https://www.wegene.com/contents/ajax/update/get_list/?htmlspecialchars_decode=true&page=1';

    const response = await got.get(api);
    const data = response.data.rsm;

    ctx.state.data = {
        title: '最近更新-WeGene',
        link: link,
        item: data.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: new Date(item.add_time * 1000).toUTCString(),
            link: item.url,
        })),
    };
};
