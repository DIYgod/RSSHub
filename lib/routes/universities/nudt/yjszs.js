const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.id = ctx.params.id || '0';

    let currentUrl;
    const rootUrl = 'http://yjszs.nudt.edu.cn/';

    if (ctx.params.id === '0') {
        currentUrl = `${rootUrl}/pubweb/homePageList/searchContent.view`;
    } else {
        currentUrl = `${rootUrl}/pubweb/homePageList/recruitStudents.view?keyId=${ctx.params.id}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('div.info').remove();

    const list = $('div.news-list ul li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
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

                    item.title = content('h1').text();
                    item.pubDate = new Date(content('p.time').eq(0).text() + ' GMT+8').toUTCString();

                    content('h1').remove();
                    content('div.time-browse').remove();

                    item.description = content('div.content').html();

                    return item;
                })
        )
    );

    let title = $('h2').text();
    title = title || '通知公告';

    ctx.state.data = {
        title: `${title} - 国防科技大学研究生招生信息网`,
        link: currentUrl,
        item: items,
    };
};
