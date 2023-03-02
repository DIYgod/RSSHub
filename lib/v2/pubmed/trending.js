const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const filters = ctx.params.filters;

    const rootUrl = 'https://pubmed.ncbi.nlm.nih.gov';
    const currentUrl = `${rootUrl}/trending${filters ? `?filter=${filters.replace(/,/g, '&filter=')}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a[data-article-id]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('data-article-id')}`,
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

                item.doi = content('meta[name="citation_doi"]').attr('content');
                item.pubDate = parseDate(content('meta[name="citation_date"]').attr('content'));
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    authors: content('.authors-list').html(),
                    abs: content('#enc-abstract').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Trending page - PubMed',
        link: currentUrl,
        item: items,
    };
};
