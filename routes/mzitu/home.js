const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { type = '' } = ctx.params;
    let url;

    if (type === 'hot') {
        url = 'http://adr.meizitu.net/wp-json/wp/v2/hot';
    } else {
        url = 'http://adr.meizitu.net/wp-json/wp/v2/posts?per_page=20';
    }

    const response = await axios({
        method: 'get',
        url,
    });
    const data = response.data;

    ctx.state.data = {
        title: '妹子图',
        link: `http://www.mzitu.com/${type}`,
        item: data.map((item) => {
            if (type === 'hot') {
                item.thumb_src = item.thumb_src_min;
            }

            return {
                title: item.title,
                description: `<img referrerpolicy="no-referrer" src="${item.thumb_src}">`,
                link: `http://www.mzitu.com/${item.id}`,
            };
        }),
    };
};
