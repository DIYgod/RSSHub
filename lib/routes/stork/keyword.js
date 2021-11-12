const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const trackID = String(ctx.params.trackID);
    const displayKey = String(ctx.params.displayKey);

    const response = await got({
        method: 'get',
        url: `https://www.storkapp.me/paper/showPaperList.php?trackID=${trackID}&displayKey=${displayKey}`,
    });

    const $ = cheerio.load(response.data);

    const reg = /^Keyword: (.*) \(\d+ results\)$/;
    const keyword = reg.exec($('h2').text())[1];
    const lines = $('tr');

    const out = await Promise.all(
        lines
            .map(async (index, item) => {
                item = $(item);
                const cells = item.find('td');

                const author = cells.eq(1).text();
                const title = cells.eq(2).text();
                const link = cells.eq(2).find('a').attr('href').replace(/^\./, '');
                const fulltext_link = `https://www.storkapp.me/paper${link}`;
                const journal = cells
                    .eq(3)
                    .text()
                    .replace(/ \(\d+(\.\d+)?\)$/, '');

                const description = await ctx.cache.tryGet(fulltext_link, async () => {
                    const result = await got.get(fulltext_link);
                    const $ = cheerio.load(result.data);

                    return $('#abstractHolder').text();
                });

                const result = {
                    title,
                    description,
                    link: fulltext_link,
                    author,
                    category: journal,
                };
                return Promise.resolve(result);
            })
            .get()
    );

    ctx.state.data = {
        title: `Stork 追踪关键词：${keyword}`,
        link: `https://www.storkapp.me/paper/showPaperList.php?trackID=${trackID}&displayKey=${displayKey}`,
        item: out,
    };
};
