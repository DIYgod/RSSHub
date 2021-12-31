const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const cleanContent = (language, content) => {
    switch (language) {
        case 'cn': {
            return content.replace(/<strong>版权声明：日本经济新闻社版权所有，未经授权不得转载或部分复制，违者必究。<\/strong>/g, '');
        }
        case 'zh': {
            return content.replace(/<strong>版權聲明：日本經濟新聞社版權所有，未經授權不得轉載或部分複製，違者必究。<\/strong>/g, '');
        }
    }
};

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'cn';
    const category = ctx.params.category ?? '';
    const type = ctx.params.type ?? '';

    const rootUrl = `https://${language === 'zh' ? `zh.cn` : language}.nikkei.com`;
    const currentUrl = `${rootUrl}/${category ? `${category}${type ? `/${type}` : ''}.html` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('dt a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${link.indexOf('http') === 0 ? '' : rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const pages = await Promise.all(
                    content('.article_pagination')
                        .toArray()
                        .map((p) =>
                            ctx.cache.tryGet(content(p).find('a').attr('href'), async () => {
                                const link = content(p).find('a').attr('href');

                                const pageResponse = await got({
                                    method: 'get',
                                    url: `${link.indexOf('http') === 0 ? '' : rootUrl}${link}`,
                                });

                                const pageContent = cheerio.load(pageResponse.data);

                                pageContent('.pagenavbar').remove();

                                return pageContent('.newsText').html();
                            })
                        )
                );

                content('.pagenavbar').remove();

                item.author = content('meta[name="author"]').attr('content');
                item.description = cleanContent(language, content('.newsText').html() + pages.join(''));
                item.pubDate = timezone(parseDate(item.link.match(/(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/)[1], 'YYYY-MM-DD-HH-mm-ss'), +9);

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
