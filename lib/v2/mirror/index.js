const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
    linkify: true,
});

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://mirror.xyz';
    const currentUrl = id.endsWith('.eth') ? `${rootUrl}/${id}` : `https://${id}.mirror.xyz`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/"__NEXT_DATA__" type="application\/json">({"props":.*})<\/script>/)[1]);

    const items = data.props.pageProps.project.posts.map((item) => ({
        title: item.title,
        description: md.render(item.body),
        link: `${currentUrl}/${item._id}`,
        pubDate: parseDate(item.timestamp * 1000),
        author: item.publisher.project.displayName,
    }));

    ctx.state.data = {
        title: `${data.props.pageProps.project.displayName} - Mirror`,
        link: currentUrl,
        item: items,
    };
};
