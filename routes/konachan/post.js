const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const { limit = 100, page, tags } = ctx.query;

    const response = await axios({
        method: 'get',
        url: 'https://konachan.com/post.json',
        headers: {
            'User-Agent': config.ua,
        },
        params: {
            limit,
            page,
            tags,
        },
    });

    const posts = response.data;

    ctx.state.data = {
        title: 'Konachan.com Anime Wallpapers',
        link: 'https://konachan.com/post',
        item: posts.map((post) => {
            const content = (url) => {
                let result = `<img src="${url}" />`;
                if (post.source) {
                    result += `<a href="${post.source}">source</a>`;
                }
                if (post.parent_id) {
                    result += `<a href="https://konachan.com/post/show/${post.parent_id}">parent</a>`;
                }
                return result;
            };

            const created_at = post.created_at * 1e3;

            return {
                title: post.tags,
                id: `${ctx.url}#${post.id}`,
                guid: `${ctx.url}#${post.id}`,
                link: `https://konachan.com/post/show/${post.id}`,
                author: post.author,
                published: new Date(created_at).toISOString(),
                pubDate: new Date(created_at).toUTCString(),
                description: content(post.sample_url),
                summary: content(post.sample_url),
                content: content(post.file_url),
                image: post.file_url,
                category: post.tags.split(/\s+/),
            };
        }),
    };
};
