const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || 'zh';

    const rootUrl = 'https://www.cas.cn';
    const currentUrl = `${rootUrl}/cg/${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('#content li')
        .not('.gl_line')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: `${rootUrl}/cg/${ctx.params.caty}${a.attr('href').replace('.', '')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.TRS_Editor').html();
                item.pubDate = new Date(content('meta[name="PubDate"]').attr('content') + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace('----', ' - '),
        link: currentUrl,
        item: items,
    };
};
