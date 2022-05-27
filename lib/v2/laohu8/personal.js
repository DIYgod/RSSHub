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
    const list = $('ul.list-unstyled > li')
        .map((_index, item) => ({
            title: $(item).find('a.tweet-link.stretched-link').attr('title'),
            link: new URL($(item).find('a.tweet-link.stretched-link').attr('href'), rootUrl),
            pubDate: parseDate($(item).find('span.publish-time').text().replace('·', ''), ['HH:mm', 'MM-DD', 'MM-DD HH:mm']),
            time: $(item).find('span.publish-time').text().replace('·', ''),
        }))
        .get()
        .filter((item) => item.title);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const $ = cheerio.load(detailResponse.data);
                item.description = $('article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `老虎社区 - ${author} 个人社区`,
        link: url,
        item: items,
    };
};
