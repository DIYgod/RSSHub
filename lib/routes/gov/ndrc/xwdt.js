const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || 'xwfb';

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = caty.indexOf('dt') < 0 ? `${rootUrl}/xwdt/${caty}` : `${rootUrl}/xwdt/dt/${caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.u-list li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.indexOf('../../..') === 0) {
                link = `${rootUrl}${link.replace('../../..', '')}`;
            } else if (link.indexOf('.') === 0) {
                link = `${currentUrl}${link.replace('.', '')}`;
            }
            return {
                title: item.text(),
                link,
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

                item.description = content('.TRS_Editor').html() || content('.article_con').html();
                item.pubDate = new Date(content('meta[name="PubDate"]').attr('content') + ' GMT+8').toUTCString();

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
