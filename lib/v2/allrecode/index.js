const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'posts';

    const rootUrl = 'https://allrecode.com';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('h3 a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.author = content('.author').text();
                item.category = content('meta[name="keywords"]').attr('content').split(',');
                item.pubDate = timezone(
                    parseDate(
                        content('.edit')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
                    ),
                    +8
                );

                content('.edit, .shang').remove();

                item.description = content('.article-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
