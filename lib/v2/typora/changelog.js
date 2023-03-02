const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'https://support.typora.io';

    const { data } = await got(`${host}/store/`);

    const list = Object.values(data)
        .filter((i) => i.category === 'new')
        .map((i) => ({
            title: i.title,
            author: i.author,
            description: i.content,
            link: `${host}${i.url}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);

                item.pubDate = parseDate($('.post-meta time').text());
                item.description = $('#post-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Typora Changelog',
        link: host,
        description: 'Typora Changelog',
        image: `${host}/assets/img/favicon-128.png`,
        item: items,
    };
};
