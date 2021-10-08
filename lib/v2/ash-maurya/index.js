const got = require('@/utils/got');
const cheerio = require('cheerio');

async function getList(rootUrl) {
    const pages = [];
    let next = rootUrl;
    do {
        // eslint-disable-next-line no-await-in-loop
        const response = await got({ method: 'get', url: next });
        const $ = cheerio.load(response.data);
        pages.push(
            $('article').map((_, item) => ({
                title: $(item).find('.post-card-title').text(),
                link: rootUrl + $(item).find('.post-card-content-link').attr('href'),
            }))
        );
        next = $('link[rel=next]').attr('href');
    } while (next);
    return pages.reduce((acc, page) => cheerio.merge(acc, page)).get();
}

module.exports = async (ctx) => {
    const rootUrl = 'https://blog.leanstack.com/';

    const list = await getList(rootUrl);

    const items = (
        await Promise.all(
            list.map(({ link, title }) =>
                ctx.cache.tryGet(link, () =>
                    got({ method: 'get', url: link })
                        .then(({ data }) => {
                            const content = cheerio.load(data);

                            return {
                                link,
                                title,
                                author: 'Ash Maurya',
                                description: (content('.post-full-image').html() ?? '') + content('.post-content').html(),
                                pubDate: content('meta[property="article:published_time"]').attr('content'),
                            };
                        })
                        .catch(() => null)
                )
            )
        )
    ).filter((x) => x !== null);

    ctx.state.data = {
        title: "Ash Maurya's blog",
        link: rootUrl,
        item: items,
    };
};
