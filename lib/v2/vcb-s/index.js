const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://vcb-s.com';
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

module.exports = async (ctx) => {
    const limit = ctx.query.limit ?? 7;
    const url = `${postsAPIUrl}?per_page=${limit}&_embed`;

    const response = await got.get(url);
    if (typeof response.data === 'string') {
        response.data = JSON.parse(response.body.trim());
    }
    const data = response.data;

    const items = data.map((item) => {
        const description = art(path.join(__dirname, 'templates/post.art'), {
            post: item.content.rendered.replace(/<pre class="js-medie-info-detail.*?>(.*?)<\/pre>/gs, '<pre><code>$1</code></pre>').replace(/<div.+?dw-box-download.+?>(.*?)<\/div>/gs, '<pre>$1</pre>'),
            medias: item._embedded['wp:featuredmedia'],
        });

        return {
            title: item.title.rendered,
            link: item.link,
            description,
            pubDate: parseDate(item.date_gmt),
            author: item._embedded.author[0].name,
        };
    });

    ctx.state.data = {
        title: 'VCB-Studio - 大家一起实现的故事！',
        link: rootUrl,
        item: items,
    };
};
