const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || '';

    const rootUrl = 'http://www.cria.org.cn';
    const currentUrl = `${rootUrl}/${id ? `newslist/${id}.html` : 'news'}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.ch_news,.enterprise_news_c')
        .find('ul li')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');

            return {
                link: `${rootUrl}${a.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = cheerio.load(detailResponse.data);

                        item.title = content('title').text();
                        item.description = content('.news_details_c').html();
                        item.pubDate = new Date(detailResponse.data.match(/<span>发布时间：(.*)<\/span><span>来源:/)[1]).toUTCString();

                        return item;
                    } catch (e) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    const title = id ? response.data.match(/<h3><span style="margin: 10px; font-size:15px;">当前位置：中国橡胶网 > (.*)<\/span><\/h3>/)[1] : '新闻资讯';

    ctx.state.data = {
        title: `${title} - 中国橡胶网`,
        link: currentUrl,
        item: items,
    };
};
