const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://aeon.co/essays`;
    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.articles.map((item) => ({
        title: item.title,
        author: item.authors.map((author) => author.displayName).join(', '),
        link: `https://aeon.co/essays/${item.slug}`,
        pubDate: item.createdAt,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                // It seems that the method based on __NEXT_DATA__
                // does not include the information of the two-column
                // images in the article body,
                // e.g. https://aeon.co/essays/how-to-mourn-a-forest-a-lesson-from-west-papua .
                // But that's very rare.
                const data = JSON.parse($('script#__NEXT_DATA__').text());
                const banner = `<img src="${data.props.pageProps.article.thumbnail.urls.header}">`;
                const authorsBio = data.props.pageProps.article.authors.map((author) => '<p>' + author.displayName + author.authorBio.replace(/^<p>/g, ' ')).join('');
                const capture = cheerio.load(data.props.pageProps.article.body);
                capture('p.pullquote').remove();
                item.description = banner + authorsBio + capture.html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `AEON | Essays`,
        link: url,
        item: items,
    };
};
