const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'bbs4';
    const type = ctx.params.type ?? '';
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://www.cool18.com';
    const indexUrl = `${rootUrl}/${id}/index.php`;
    const currentUrl = `${indexUrl}${keyword ? (type ? (type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&${type}=${keyword}&submit=${type === 'type' ? '查询' : '栏目搜索'}`) : '') : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('#d_list ul li, #thread_list li, .t_l .t_subject')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                link: `${rootUrl}/${id}/${a.attr('href')}`,
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

                item.title = content('title').text().replace(' - cool18.com', '');
                item.author = detailResponse.data.match(/送交者: .*>(.*)<.*\[/)[1];
                item.pubDate = parseDate(detailResponse.data.match(/于 (.*) 已读/)[1]).toUTCString();
                item.description = content('pre')
                    .html()
                    .replace(/<font color="#E6E6DD">cool18.com<\/font>/g, '');

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
