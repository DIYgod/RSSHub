const got = require('@/utils/got');
const cheerio = require('cheerio');
const currentURL = 'https://bytes.dev/archives';
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const resp = await got(currentURL);
    const $ = cheerio.load(resp.data);
    const text = $('script#__NEXT_DATA__').text();
    const json = JSON.parse(text);
    const posts = [json.props.pageProps.featuredPost].concat(json.props.pageProps.posts);
    const items = posts.map((item) => ({
        title: `Issue ${item.slug}`,
        pubDate: parseDate(item.date),
        description: item.title,
        link: `/archives/${item.slug}`,
    }));

    ctx.state.data = {
        title: 'bytes.dev',
        description: 'Your weekly dose of JS',
        link: currentURL,
        item: items,
    };
};
