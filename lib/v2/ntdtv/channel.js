const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://www.ntdtv.com';

module.exports = async (ctx) => {
    const language = ctx.params.language;
    const id = ctx.params.id;
    const url = `${host}/${language}/${id}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('h1.block_title').text();
    const list = $('div.list_wrapper > div')
        .map((_, item) => ({
            title: $(item).find('div.title').text(),
            link: $(item).find('div.title > a').attr('href'),
            description: $(item).find('div.excerpt').text(),
        }))
        .get()
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('div.post_content').html();
                item.pubDate = timezone(parseDate(content('div.time > span').text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `新唐人电视台 - ${title}`,
        link: url,
        item: items,
    };
};
