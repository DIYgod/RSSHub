const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.deeplearning.ai/WPCore/wp-admin/admin-ajax.php?action=hubspot_reader_blog_the_batch&offset=0&limit=5`,
    });
    const list = response.data.data.map((item) => ({
        title: `${item.title} - ${item.name}`,
        link: item.web_view_url,
        pubDate: new Date(item.date).toUTCString(),
    }));

    ctx.state.data = {
        title: `The Batch - a new weekly newsletter from deeplearning.ai`,
        link: `https://www.deeplearning.ai/thebatch/`,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const contentResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(contentResponse.data);
                        item.description = content('td[style="width: 576px;"]').parent().html();
                        return item;
                    })
            )
        ),
    };
};
