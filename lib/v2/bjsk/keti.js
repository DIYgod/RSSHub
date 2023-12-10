const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '402881027cbb8c6f017cbb8e17710002';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 100;

    const rootUrl = 'https://keti.bjsk.org.cn';
    const currentUrl = `${rootUrl}/articleAction!to_moreList.action?entity.columnId=${id}&pagination.pageSize=${limit}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a.news')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.zizizi').text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.date').text()),
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

                item.description = content('.d_text').html();
                item.author = content('div.d_information p span').last().text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `北京社科基金项目管理平台 - ${$('.noticetop').text()}`,
        link: currentUrl,
        item: items,
    };
};
