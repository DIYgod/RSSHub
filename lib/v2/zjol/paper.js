const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'zjrb';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 100;

    const query = id === 'jnyb' ? 'map[name="PagePicMap"] area' : 'ul.main-ed-articlenav-list li a';

    const rootUrl = id === 'qjwb' ? 'http://qjwb.thehour.cn' : `https://${id}.zjol.com.cn`;
    let currentUrl = `${rootUrl}/paperindex.htm`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    const url = response.data.match(/URL=(.*)"/)[1];
    const pubDate = parseDate(url.match(/(\d{4}-\d{2}\/\d{2})/)[1], 'YYYY-MM/DD');

    currentUrl = `${rootUrl}/${url.replace(`/${url.split('/').pop()}`, '')}`;

    response = await got({
        method: 'get',
        url: `${rootUrl}/${url}`,
    });

    const $ = cheerio.load(response.data);

    let items = $(query)
        .toArray()
        .map((a) => `${currentUrl}/${$(a).attr('href')}`);

    await Promise.all(
        $('#pageLink')
            .slice(1)
            .toArray()
            .map((p) => `${currentUrl}/${$(p).attr('href')}`)
            .map(async (p) => {
                const pageResponse = await got({
                    method: 'get',
                    url: p,
                });

                const page = cheerio.load(pageResponse.data);

                items.push(
                    ...page(query)
                        .toArray()
                        .map((a) => `${currentUrl}/${page(a).attr('href')}`)
                );
            })
    );

    items = await Promise.all(
        items
            .filter((a) => (id === 'jnyb' ? /\?div=1$/.test(a) : true))
            .slice(0, limit)
            .map((link) =>
                ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    const title = content('.main-article-title').text();

                    content('.main-article-alltitle').remove();

                    return {
                        title,
                        pubDate,
                        link: link.split('?')[0],
                        description: content('.main-article-content').html(),
                    };
                })
            )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
