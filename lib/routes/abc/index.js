const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.site = ctx.params.site || '';

    const rootUrl = 'https://mobile.abc.net.au';
    const currentUrl = `${rootUrl}/news/${ctx.params.site}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    $('._3zQMR, .ticker').remove();

    const list = $('h3')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(rootUrl, item.parents('a').attr('href') || item.find('a').attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('.modal-content').remove();

                content('img').each(function () {
                    content(this).attr('src', content(this).attr('data-src'));
                });

                let coverImage, contentBody;
                if (content('div[data-component="FeatureMedia"]').html() !== null) {
                    coverImage = content('div[data-component="FeatureMedia"]').html();
                } else {
                    coverImage = content('.view-hero-media').html();
                }
                if (content('#body').html() !== null) {
                    contentBody = content('#body').html();
                } else {
                    contentBody = content('.article-text').html();
                }

                const authorsArray = [];
                const authorsMatch = detailResponse.data.match(/author":(.*),"dateModified/);
                if (authorsMatch === null) {
                    authorsArray.push(content('meta[name="DCTERMS.contributor"]').attr('content'));
                } else {
                    const authors = JSON.parse(authorsMatch[1]);
                    try {
                        for (const author of authors) {
                            authorsArray.push(author.name);
                        }
                    } catch (e) {
                        authorsArray.push(authors.name);
                    }
                }

                item.description = coverImage + contentBody;
                item.pubDate = new Date(content('meta[property="article:published_time"]').attr('content')).toUTCString();
                item.author = authorsArray.join(', ');

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
