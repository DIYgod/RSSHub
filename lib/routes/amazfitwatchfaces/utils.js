const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, currentUrl) => {
    const rootUrl = `https://amazfitwatchfaces.com/`;
    currentUrl = `${rootUrl}${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('#wf-row div.col-md-3')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: url.resolve(rootUrl, $(item).find('a.wf-act').attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(detailResponse.data);
                    const date = content('i.fa-calendar').parent().find('span').text();
                    const ymd = date.split(' ')[0];

                    item.title = `[${content('code').text()}] ${content('title').text().split(' - ')[0]}`;
                    item.description = `<img src="${content('#watchface-preview').attr('src')}"><br>${content('div.unicodebidi').text()}`;
                    item.pubDate = new Date(`${ymd.split('.')[2]}-${ymd.split('.')[1]}-${ymd.split('.')[0]} ${date.split(' ')[1]}`).toUTCString();
                    return item;
                })
        )
    );

    return {
        title: `${$('title').text().split('|')[0]} | Amazfit Watch Faces`,
        link: currentUrl,
        item: items,
    };
};
