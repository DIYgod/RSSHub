const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    nba: {
        title: 'NBA',
        data: 'news',
    },
    cba: {
        title: 'CBA',
        data: 'news',
    },
    soccer: {
        title: '足球',
        data: 'soccerIndexData',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'soccer';

    const rootUrl = 'https://m.hupu.com';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/"pageProps":(.*)},"page":"\//)[1]);

    let items = data[categories[category].data].map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.publishTime), +8),
        link: item.link.replace(/bbs\.hupu.com/, 'm.hupu.com/bbs'),
    }));

    items = await Promise.all(
        items
            .filter((item) => !/subject/.test(item.link))
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });

                        const content = cheerio.load(detailResponse.data);

                        item.author = content('.bbs-user-info-name').text();
                        item.description = content('#bbs-thread-content').html();
                        item.category = content('.bbs-link')
                            .toArray()
                            .map((c) => content(c).text());
                    } catch (e) {
                        // no-empty
                    }

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: `虎扑 - ${categories[category].title}`,
        link: currentUrl,
        item: items,
    };
};
