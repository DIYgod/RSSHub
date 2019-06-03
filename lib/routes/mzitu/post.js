const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const contentUrl = `http://adr.meizitu.net/wp-json/wp/v2/i?id=${id}`;
    const postUrl = `http://adr.meizitu.net/wp-json/wp/v2/posts/${id}`;
    const link = `http://www.mzitu.com/${id}`;

    const contentResponse = await axios({
        method: 'get',
        url: contentUrl,
    });
    const content = contentResponse.data.content.split(',');

    const postResponse = await axios({
        method: 'get',
        url: postUrl,
    });
    const { title } = postResponse.data;

    ctx.state.data = {
        title: title,
        link,
        item: content.map((url, index) => {
            url = url.replace(/"/g, '');

            return {
                title: `${title}（${index + 1}）`,
                description: `<img referrerpolicy="no-referrer" src="${url}">`,
                link: url,
            };
        }),
    };
};
