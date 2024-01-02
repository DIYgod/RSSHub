const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://backlinko.com';
    const { data: response, url: link } = await got(`${baseUrl}/blog`);

    const $ = cheerio.load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const buildId = nextData.buildId;

    const posts = nextData.props.pageProps.posts.nodes.concat(nextData.props.pageProps.backlinkoLockedPosts.nodes).map((post) => ({
        title: post.title,
        link: `${baseUrl}/${post.slug}`,
        pubDate: parseDate(post.modified),
        author: post.author.node.name,
        apiUrl: `${baseUrl}/_next/data/${buildId}/${post.slug}.json`,
    }));

    const items = await Promise.all(
        posts.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.apiUrl);
                const post = data.pageProps.post || data.pageProps.lockedPost;

                item.description = post.content;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: nextData.props.pageProps.page.seo.title,
        description: nextData.props.pageProps.page.seo.metaDesc,
        link,
        language: 'en',
        item: items,
    };
};
