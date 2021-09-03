const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const limit = ctx.query.limit || 5;
    const rootUrl = 'https://jikipedia.com';
    const response = await got(rootUrl);

    const $ = cheerio.load(response.data);

    const list = $('div[data-category="definition"]')
        .slice(0, limit > 15 ? 15 : limit)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h1.title.pre').text().trim(),
                link: `${rootUrl}` + '/definition/' + item.attr('data-id') + '?action=lite-card',
            };
        })
        .get();
    if (!list) {
        ctx.throw(403, 'Rate limited');
        return;
    }

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    header: {
                        Referer: `${rootUrl}`,
                    },
                });

                const content = cheerio.load(detailResponse.data);
                const image = content('div.show.image.button').html();
                const categories = [];

                content('div.tag-list div.tag-list-item.cursor.link div.tag-text').each((_, e) => {
                    categories.push(content(e).text().trim());
                });

                content('div.modal-container').remove();

                item.author = content('div.author-name-container').text().trim();
                item.category = categories;
                item.description = content('.content').html() + (image ? image : '') || item.title;
                item.pubDate = timezone(parseDate(content('div.created.basic-info-element').text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '小鸡词典 - 查网络流行语，就上小鸡词典',
        description:
            '查网络流行语，就上小鸡词典。小鸡词典专注于网络流行语的收录和解释，以最快的速度在全网捕捉当下的网络热词。以简单明了，清晰易懂的形式，向用户介绍网络流行语的含义、来历、传播过程和引申义。用户不仅能够通过小鸡词典了解网络用语，还能接触到小众黑话、新梗热梗、弹幕用语、方言俚语等不同的流行文化，以及网友们自主创造的旧词新解等。',
        link: rootUrl,
        item: items,
    };
};
