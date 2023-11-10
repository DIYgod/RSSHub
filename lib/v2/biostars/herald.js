const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const homeUrl = 'https://www.biostars.org/t/herald';

const baseUrl = 'https://www.biostars.org';

module.exports = async (ctx) => {
    const response = await got(homeUrl);

    const $ = cheerio.load(response.data);

    const list = $('div.items .content .title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: $(item).text().trim(),
                link: baseUrl + $(item).attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('div.content div.wrap.magnify').first().html();
                item.pubDate = parseDate($('div.content time').attr('datetime'));
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'The Biostar Herald Weekly',
        link: homeUrl,
        item: items,
    };
};
