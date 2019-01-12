const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { period = '1d' } = ctx.params;

    const baseURL = ctx.path.startsWith('/konachan.net') ? 'https://konachan.net' : 'https://konachan.com';

    const response = await axios({
        method: 'get',
        baseURL,
        url: '/post/popular_recent.json',
        params: {
            period,
        },
    });

    const posts = response.data;

    const titles = {
        '1d': 'Exploring last 24 hours ',
        '1w': 'Exploring last week',
        '1m': 'Exploring last month',
        '1y': 'Exploring last year',
    };

    const title = titles[period] || titles['1d'];

    ctx.state.data = {
        title: `${title} - Konachan Anime Wallpapers`,
        link: `${baseURL}/post/popular_recent`,
        item: posts.map((post) => {
            const content = (url) => {
                if (url.startsWith('//')) {
                    url = 'https:' + url;
                }
                let result = `<img referrerpolicy="no-referrer" src="${url}" />`;
                if (post.source) {
                    result += `<a href="${post.source}">source</a>`;
                }
                if (post.parent_id) {
                    result += `<a href="${baseURL}/post/show/${post.parent_id}">parent</a>`;
                }
                return result;
            };

            const created_at = post.created_at * 1e3;

            return {
                title: post.tags,
                id: `${ctx.path}#${post.id}`,
                guid: `${ctx.path}#${post.id}`,
                link: `${baseURL}/post/show/${post.id}`,
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
