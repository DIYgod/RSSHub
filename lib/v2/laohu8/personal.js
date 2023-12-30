const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.laohu8.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `${rootUrl}/personal/${id}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const author = $('h2.personal-name').text();
    const data = JSON.parse($('#__APP_DATA__').text()).tweetList;

    const items = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(item.link, () => ({
                title: item.title,
                description: String(item.htmlText).replace(/\n/g, '<br><br>'),
                link: `${rootUrl}/post/${item.id}`,
                pubDate: parseDate(item.gmtCreate),
            }))
        )
    );

    ctx.state.data = {
        title: `老虎社区 - ${author} 个人社区`,
        link: url,
        item: items,
    };
};
