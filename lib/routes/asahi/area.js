const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.asahi.com';
    const currentUrl = `${rootUrl}/area/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.Time').remove();

    const list = $('#MainInner .Section .List li a')
        .slice(0, 6)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                link: link.indexOf('//') < 0 ? `${rootUrl}${link}` : `https:${link}`,
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

                    content('._30SFw, .-Oj2D, .notPrint').remove();

                    item.description = content('._3YqJ1').html();
                    item.title = content('meta[name="TITLE"]').attr('content');
                    item.pubDate = Date.parse(content('meta[name="pubdate"]').attr('content'));

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: '朝日新聞社のニュースサイト、朝日新聞デジタルの社会ニュースについてのページです',
    };
};
