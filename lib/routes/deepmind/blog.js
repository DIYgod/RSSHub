const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://deepmind.com';
    const currentUrl = `${rootUrl}/api/search/?content_type=blog&filters=${category === '' ? '' : `{"category":["${category}"]}`}&page=1&pagelen=21&q=&sort=relevance`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.substr(5, response.data.length - 5));

    const list = data.results.slice(0, 10).map((item) => ({
        title: item.title,
        link: `${rootUrl}${item.link.internal_page}`,
        pubDate: new Date(item.date).toUTCString(),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.user-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${category === '' ? 'Blog' : category} | DeepMind`,
        link: `${rootUrl}/blog?filters=${category === '' ? '' : `{"category":["${category}"]}`}`,
        item: items,
    };
};
