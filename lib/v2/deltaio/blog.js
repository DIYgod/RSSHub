const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const baseUrl = 'https://delta.io';
    const dataUrl = `${baseUrl}/page-data/blog/page-data.json`;

    const data = await ctx.cache.tryGet(
        dataUrl,
        async () => {
            const { data } = await got(dataUrl);
            return data;
        },
        config.cache.routeExpire,
        false
    );

    const items = data.result.data.allMdx.edges.map(({ node }) => ({
        title: node.frontmatter.title,
        description: node.frontmatter.description,
        author: node.frontmatter.author,
        pubDate: parseDate(node.frontmatter.date),
        link: `${baseUrl}${node.fields.slug}`,
        itunes_item_image: `${baseUrl}${node.frontmatter.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src}`,
    }));

    ctx.state.data = {
        title: 'delta.io blog',
        link: `${baseUrl}/blog`,
        item: items,
    };
};
