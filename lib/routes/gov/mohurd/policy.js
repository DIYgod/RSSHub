const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.mohurd.gov.cn/wjfb/index.html`;
    const response = await got({ method: 'get', url: link });

    const $ = cheerio.load(response.data);
    const list = $('body table tbody tr')
        .eq(3)
        .find('td table tbody tr')
        .eq(2)
        .find('td table tbody tr')
        .map((_, item) => {
            const a = $(item).find('a');
            const subtitle = $(item).find('td').eq(2).text();
            return {
                title: a.text() + (subtitle === '' ? '' : ' - ' + subtitle),
                link: a.attr('href'),
                pubDate: new Date($(item).find('td').eq(3).text().substr(1, 10) + ' GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '中华人民共和国住房和城乡建设部 - 政策发布',
        link: link,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(detailResponse.data);
                        item.description = content('table[bgcolor="#ffffff"]').html();
                        return item;
                    })
            )
        ),
    };
};
