const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://www.soundofhope.org';

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const id = ctx.params.id;
    const url = `${host}/${channel}/${id}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('div.left > nav').text().split('/').slice(1).join('');
    const list = $('div.item')
        .map((_, item) => ({
            title: $(item).find('div.title').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('div.Content__Wrapper-sc-1bvya0-0').html();
                item.pubDate = timezone(parseDate(content('div.date').text(), 'YYYY.M.D HH:mm'), -8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `希望之声 - ${title}`,
        link: url,
        item: items,
    };
};
