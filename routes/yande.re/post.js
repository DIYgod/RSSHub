const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const { tags = '' } = ctx.params;

    const response = await axios({
        method: 'get',
        url: `https://yande.re/post.json?tags=${tags}`,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const posts = response.data;

    let title = 'yande.re';
    if (tags) {
        title = decodeURIComponent(tags) + ' - ' + title;
    }

    ctx.state.data = {
        title,
        link: 'https://yande.re/post',
        item: posts.map((post) => {
            const content = (url) => {
                let result = `<img referrerpolicy="no-referrer" src="${url}" />`;
                if (post.source) {
                    result += `<a href="${post.source}">source</a>`;
                }
                if (post.parent_id) {
                    result += `<a href="https://yande.re/post/show/${post.parent_id}">parent</a>`;
                }
                return result;
            };

            const created_at = post.created_at * 1e3;

            return {
                title: post.tags,
                id: `${ctx.path}#${post.id}`,
                guid: `${ctx.path}#${post.id}`,
                link: `https://yande.re/post/show/${post.id}`,
                author: post.author,
                published: new Date(created_at).toISOString(),
                pubDate: new Date(created_at).toUTCString(),
                description: content(post.sample_url),
                summary: content(post.sample_url),
                content: { html: content(post.file_url) },
                image: post.file_url,
                category: post.tags.split(/\s+/),
            };
        }),
    };
};
