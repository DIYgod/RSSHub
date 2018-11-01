const axios = require('../../utils/axios');
const { getList } = require('./util');

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
