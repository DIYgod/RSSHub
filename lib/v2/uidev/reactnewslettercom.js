const got = require('@/utils/got');
const cheerio = require('cheerio');
const currentURL = 'https://reactnewsletter.com/issues';
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const resp = await got(currentURL);
    const $ = cheerio.load(resp.data);
    const node = $('script#__NEXT_DATA__').get(0);
    const json = JSON.parse(node.firstChild.data);

    const items = json.props.pageProps.issues.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.date),
        description: item.summary,
        link: `/issues/${item.slug}`,
    }));

    ctx.state.data = {
        title: 'reactnewsletter.dev',
        description: 'Stay up to date on the latest React news, tutorials, resources, and more. Delivered every Tuesday, for free.',
        link: currentURL,
        item: items,
    };
};
