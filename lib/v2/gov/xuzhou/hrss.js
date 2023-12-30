const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'http://hrss.xz.gov.cn';
    const currentUrl = `${rootUrl}${category ? `/001/${category}/subPage.html` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = (category ? $('.module-items a') : $('.bdl[data-target="1"]').eq(1).find('a')).toArray().map((item) => {
        item = $(item);

        const link = item.attr('href');

        return {
            title: item.attr('title'),
            link: `${/^http/.test(link) ? '' : rootUrl}${item.attr('href')}`,
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

                item.description = content('#Zoom, .mian-cont, .ewb-article-info, #UCAP-CONTENT').html();
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);
                item.category = content('meta[name="Keywords"]').attr('content')?.split(' ');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `徐州市人力资源和社会保障局 - ${category ? $('.wb-tree-items.current').text() : '通知公告'}`,
        link: currentUrl,
        item: items,
    };
};
