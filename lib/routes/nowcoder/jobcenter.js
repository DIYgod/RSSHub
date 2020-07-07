const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = `https://www.nowcoder.com/job/center/`;
    const currentUrl = `${rootUrl}?${ctx.params.type ? 'type=' + ctx.params.type : ''}${ctx.params.city ? '&city=' + ctx.params.city : ''}${ctx.params.order ? '&order=' + ctx.params.order : ''}${
        ctx.params.recruitType ? '&recruitType=' + ctx.params.recruitType : ''
    }${ctx.params.latest ? '&latest=' + ctx.params.latest : ''}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.reco-job-list li')
        .slice(0, 30)
        .map((_, item) => {
            item = $(item);
            const title = item.find('a.reco-job-title');
            const company = item.find('div.reco-job-com a');
            const time = item.find('div.reco-job-detail span').eq(1).text();
            const date = new Date();
            if (time.indexOf('天') !== -1) {
                const day = time.split('天')[0];
                date.setDate(date.getDate() - day);
            } else if (time.indexOf('小时') !== -1) {
                const hour = time.split('小时')[0];
                date.setHours(date.getHours() - hour);
            }
            return {
                title: `${company.text()} | ${title.text()}`,
                link: url.resolve(rootUrl, title.attr('href')),
                pubDate: date.toUTCString(),
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
                    item.description = content('div.rec-job').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${ctx.params.recruitType ? (ctx.params.recruitType === '2' ? '社招广场' : '实习广场') : '实习广场'} - 牛客网`,
        link: rootUrl,
        item: items,
    };
};
