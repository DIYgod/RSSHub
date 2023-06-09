const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const md = require('markdown-it')({
    html: true,
});

async function getArticles() {
    const url = 'https://www.apiseven.com/blog';
    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const json = JSON.parse($('#__NEXT_DATA__').text());
    return json.props.pageProps.list.map((item) => ({
        title: item.title,
        link: 'https://www.apiseven.com' + item.slug,
        pubDate: timezone(parseDate(item.published_at), +8),
        category: item.tags,
    }));
}

module.exports = async (ctx) => {
    const articles = await getArticles();
    const items = await Promise.all(
        articles.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: res } = await got(item.link);
                const $ = cheerio.load(res);
                const json = JSON.parse($('#__NEXT_DATA__').text());
                return {
                    title: item.title,
                    description: md.render(json.props.pageProps.post.content),
                    link: item.link,
                    pubDate: item.pubDate,
                    author: json.props.pageProps.post.author_name,
                };
            })
        )
    );

    ctx.state.data = {
        title: '博客 | 支流科技',
        link: 'https://www.apiseven.com/blog',
        item: items,
    };
};
