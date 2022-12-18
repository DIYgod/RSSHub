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

    const response = await got(currentUrl);

    const data = JSON.parse(response.data.match(/"__NEXT_DATA__" type="application\/json">({"props":.*})<\/script>/)[1]);

    const items = Object.keys(data.props.pageProps.__APOLLO_STATE__)
        .filter((key) => key.startsWith('entry:'))
        .map((key) => {
            const item = data.props.pageProps.__APOLLO_STATE__[key];
            return {
                title: item.title,
                description: md.render(item.body),
                link: `${currentUrl}/${item._id}`,
                pubDate: parseDate(item.publishedAtTimestamp, 'X'),
                author: data.props.pageProps.publicationLayoutProject.displayName,
            };
        });

    ctx.state.data = {
        title: `${data.props.pageProps.publicationLayoutProject.displayName} - Mirror`,
        description: data.props.pageProps.publicationLayoutProject.description,
        image: data.props.pageProps.publicationLayoutProject.avatarURL,
        link: currentUrl,
        item: items,
    };
};
