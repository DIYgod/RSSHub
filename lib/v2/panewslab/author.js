const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/subject/articles?Rn=${ctx.query.limit ?? 25}&LId=1&tw=0&uid=${id}`;
    const currentUrl = `${rootUrl}/zh/author/${id}.html`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.map((item) => ({
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.publishTime * 1000),
        link: `${rootUrl}/zh/articledetails/${item.id}.html`,
        description: `<blockquote>${item.desc}</blockquote>`,
        category: item.tags,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description += content('#txtinfo').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `PANews - ${items[0].author}`,
        link: currentUrl,
        item: items,
    };
};
