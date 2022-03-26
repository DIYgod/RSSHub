const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '0';

    const rootUrl = 'https://www.popyard.com';
    const currentUrl = `${rootUrl}/cgi-mod/threads.cgi?cate=${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('li a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}/cgi-mod${item.attr('href').replace('.', '')}`,
                author: item.next().text().split('[')[0],
                pubDate: new Date(
                    item
                        .next()
                        .text()
                        .match(/\[(.*)\]/)[1] + 'GMT+8'
                ).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: currentUrl,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                const description = content('#sponser').parent();

                const pages = description.parents('p').eq(0).next('p').find('font a');

                const subPages = [],
                    pageLinks = [];

                pages.each(function () {
                    pageLinks.push(`${rootUrl}/cgi-mod${content(this).attr('href').replace('.', '')}`);
                });

                if (pages.length > 0) {
                    pageLinks.forEach((link) =>
                        ctx.cache.tryGet(link, async () => {
                            const pageResponse = await got({
                                method: 'get',
                                url: link,
                                headers: {
                                    Referer: currentUrl,
                                },
                            });
                            const subContent = cheerio.load(pageResponse.data);

                            const subDescription = subContent('#sponser').parent();

                            subContent('#sponser').prev('table').remove();
                            subContent('#sponser').remove();

                            subPages.push(subDescription.html());
                        })
                    );
                }

                content('#sponser').prev('table').remove();
                content('#sponser').remove();

                item.description = description.html() + subPages.join('');

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
