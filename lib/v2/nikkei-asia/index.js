const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const currentUrl = 'https://main-asianreview-nikkei.content.pugpig.com/editionfeed/4519/pugpig_atom_contents.json';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const stories = response.data.stories;

    const items = await Promise.all(
        stories.map((item) =>
            ctx.cache.tryGet(item.url, async () => {
                const fulltext = await got({
                    method: 'get',
                    url: `https://main-asianreview-nikkei.content.pugpig.com/editionfeed/4519/${item.url}`,
                });

                item.pubDate = parseDate(item.published);
                item.link = item.shareurl;

                const fulltextcontent = cheerio.load(fulltext.data);
                item.description = fulltextcontent('section[class="pp-article__body"]')
                    .html()
                    .replace(/\.\.\/\.\.\/\.\.\/\.\.\//g, 'https://main-asianreview-nikkei.content.pugpig.com/');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Nikkei Asia',
        link: 'https://asia.nikkei.com',
        item: items,
    };
};
