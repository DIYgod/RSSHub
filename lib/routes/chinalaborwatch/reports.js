const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const lang = ctx.params.lang || '';
    const industry = ctx.params.industry || '';

    const rootUrl = 'http://www.chinalaborwatch.org';
    const currentUrl = `${rootUrl}/${lang === '' ? '' : 'cn/'}reports${industry === '' ? '' : `/industry/${industry}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('.Alt1 a, .Alt2 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.pubDate = new Date(content('#ContentPlaceHolder1_LabelDate').text().replace(/年|月/g, '-').replace('日', '')).toUTCString();

                content('h1, #ContentPlaceHolder1_LabelDate').remove();

                item.description = content('.mainContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - ${lang === '' ? 'China Labour Watch' : '中国劳工观察'}`,
        link: currentUrl,
        item: items,
    };
};
