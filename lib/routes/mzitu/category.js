const axios = require('../../utils/axios');
const { getList } = require('./util');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const mapper = {
        xinggan: {
            name: '性感妹子',
            id: 4,
        },
        japan: {
            name: '日本妹子',
            id: 3,
        },
        taiwan: {
            name: '台湾妹子',
            id: 344,
        },
        mm: {
            name: '清纯妹子',
            id: 2,
        },
    };

    if (!mapper[category]) {
        throw new Error('Unknown category:' + category);
    }

    const url = `http://adr.meizitu.net/wp-json/wp/v2/posts?categories=${mapper[category].id}&per_page=20`;

    const response = await axios({
        method: 'get',
        url,
    });
    const data = response.data;

    ctx.state.data = {
        title: `妹子图-${mapper[category].name}`,
        link: `http://www.mzitu.com/${category}`,
        item: await Promise.all(
            data.map(async (item) => {
                const list = await getList(item.id);
                const listDescription = list.join('');
                return {
                    title: `${item.title} ${list.length} pages`,
                    description: `<img referrerpolicy="no-referrer" src="${item.thumb_src}"><br />${listDescription}`,
                    link: `http://www.mzitu.com/${item.id}`,
                };
            })
        ),
    };
};
