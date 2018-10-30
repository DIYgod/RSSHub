const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    let tag = ctx.params.tag;
    tag = tag === undefined || tag === 'undefined' ? '' : tag;

    const tagsUrl = `http://adr.meizitu.net/wp-json/wp/v2/tags?slug=${tag}`;
    const tagsResponse = await axios({
        method: 'get',
        url: tagsUrl,
    });
    const { id, name } = tagsResponse.data[0] || {};

    const tagUrl = `http://adr.meizitu.net/wp-json/wp/v2/posts?tags=${id}&per_page=20`;
    const tagResponse = await axios({
        method: 'get',
        url: tagUrl,
    });
    const data = tagResponse.data;

    ctx.state.data = {
        title: name,
        link: `http://www.mzitu.com/tag/${tag}`,
        item: data.map((item) => ({
            title: item.title,
            description: `<img referrerpolicy="no-referrer" src="${item.thumb_src}">`,
            link: `http://www.mzitu.com/${item.id}`,
        })),
    };
};
