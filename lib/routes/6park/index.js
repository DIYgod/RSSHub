const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || 'chan1';
    const type = ctx.params.type || '';
    const keyword = ctx.params.keyword || '';

    const rootUrl = 'https://club.6parkbbs.com';
    const indexUrl = `${rootUrl}/${id}/index.php`;
    const currentUrl = `${indexUrl}${type === '' || keyword === '' ? '' : type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&${type}=${keyword}&submit=${type === 'type' ? '查询' : '栏目搜索'}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#d_list ul li, #thread_list li, .t_l .t_subject')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a').eq(0);
            return {
                link: `${rootUrl}/${id}/${a.attr('href')}`,
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

                    item.title = content('title').text().replace(' -6park.com', '');
                    item.author = detailResponse.data.match(/送交者: .*>(.*)<.*\[/)[1];
                    item.pubDate = new Date(detailResponse.data.match(/于 (.*) 已读/)[1]).toUTCString();
                    item.description = content('pre')
                        .html()
                        .replace(/<font color="#E6E6DD">6park.com<\/font>/g, '');

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
