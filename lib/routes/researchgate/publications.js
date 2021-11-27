const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.researchgate.net';
    const currentUrl = `${rootUrl}/profile/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('div[itemprop="headline"] a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.doi = content('meta[property="citation_doi"]').attr('content');
                    item.pubDate = Date.parse(content('meta[property="citation_publication_date"]').attr('content'));

                    const authors = [];

                    content('meta[property="citation_author"]').each(function () {
                        authors.push(content(this).attr('content'));
                    });

                    item.author = authors.join(', ');

                    item.description = content('div[itemprop="description"]').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('meta[property="profile:username"]').attr('content')}'s Publications - ResearchGate`,
        link: currentUrl,
        item: items,
    };
};
