const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const sort = ctx.params.sort || 'top_time';
    const status = ctx.params.status || 'all';

    const rootUrl = 'https://zhongchou.modian.com';
    const currentUrl = `${rootUrl}/${category}/${sort}/${status}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.pro_title')
        .slice(0, 12)
        .map((_, item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
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

                const startTime = detailResponse.data.match(/realtime_sync\.pro_time\('(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'\);/);

                item.pubDate = startTime === null ? Date.parse(content('.start-time h3').text() || content('h3[start_time]').attr('start_time')) : Date.parse(startTime[1]);

                item.author = content('span[data-nickname]').text();
                item.description = `<img src="${content('#big_logo').attr('src')}"><br>` + content('.center-top').html() + content('#my_back_info').html() + content('#cont_match_htmlstr').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.category div span').text()} - ${$('.status div span').text()} - ${$('.sort div span').text()} - 摩点众筹`,
        link: currentUrl,
        item: items,
    };
};
