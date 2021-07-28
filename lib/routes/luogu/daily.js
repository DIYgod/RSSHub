const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || 179788;
    const link = `https://www.luogu.org/discuss/show/${id}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('title').text();

    const out = $('div.am-comment-main > div > p')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('strong').text() || $(this).text(),
                link: $(this).find('a').attr('href'),
            };
            return info;
        })
        .get();

    const items = await Promise.all(
        out.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    const timeRegExp = new RegExp(/(?<=([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d))/);

                    item.description = content('#article-content').html();

                    content('#article-content').remove();

                    const line = content
                        .html()
                        .split('\n')
                        .find((line) => timeRegExp.test(line));

                    item.pubDate = new Date(line.match(timeRegExp)[1] + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: title,
        link: link,
        item: items,
    };
};
