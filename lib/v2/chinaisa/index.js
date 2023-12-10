const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id = '58af05dfb6b4300151760176d2aad0a04c275aaadbb1315039263f021f920dcd' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 15;

    const rootUrl = 'https://www.chinaisa.org.cn';

    const apiUrl = new URL('gxportal/xfpt/portal/getColumnList', rootUrl).href;
    const apiArticleUrl = new URL('gxportal/xfpt/portal/viewArticleById', rootUrl).href;
    const currentUrl = new URL(`gxportal/xfgl/portal/list.html?columnId=${id}`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            params: encodeURI(`{"columnId":"${id}"}`),
        },
    });

    let $ = cheerio.load(response.articleListHtml);

    let items = $('ul.list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') ?? item.text(),
                link: new URL(`gxportal/xfgl/portal/${item.prop('href')}`, rootUrl).href,
                guid: item.prop('href').match(/articleId=(\w+)/)[1],
                pubDate: parseDate(item.parent().find('span.times').text().replace(/\[|\]/g, '')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got.post(apiArticleUrl, {
                    form: {
                        params: encodeURI(`{"articleId":"${item.guid}","columnId":"${id}"}`),
                    },
                });

                const articleContent = detailResponse.article_content;

                const content = cheerio.load(articleContent);

                const matches = articleContent.match(/文章来源：(.*?)日期：(\d+-\d+-\d+)/);

                item.title = content('div.article_title').contents().first().text() || item.title;
                item.description = content('div.article_main').html();
                item.author = matches[1].split(/&/)[0];
                item.guid = `chinaisa-${item.guid}`;
                item.pubDate = parseDate(matches[2]);

                return item;
            })
        )
    );

    const subtitle = $('div.head-tit').text();

    const { data: currentResponse } = await got(currentUrl);

    $ = cheerio.load(currentResponse);

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${$('title').text()} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'cn',
        image: new URL('img/logo.jpg', rootUrl).href,
        icon,
        logo: icon,
        subtitle,
        allowEmpty: true,
    };
};
