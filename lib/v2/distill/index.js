const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://distill.pub';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.post-preview')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: `${rootUrl}/${item.children('a').attr('href')}`,
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

                content('d-contents').remove();

                content('img').each(function () {
                    content(this).attr('src', `${item.link}/${content(this).attr('src')}`);
                });

                item.doi = content('meta[name="citation_doi"]').attr('content');
                item.pubDate = parseDate(content('meta[property="article:published"]').attr('content'));
                item.description = content('d-article')
                    .children()
                    .toArray()
                    .map((c) => content(c).html())
                    .join('');
                item.author = content('meta[property="article:author"]')
                    .toArray()
                    .map((author) => content(author).attr('content'))
                    .join(', ');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
