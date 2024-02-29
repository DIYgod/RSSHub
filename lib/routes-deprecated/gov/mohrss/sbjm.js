const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'ydxw';

    const rootUrl = 'http://www.mohrss.gov.cn';
    const currentUrl = `${rootUrl}/SYrlzyhshbzb/rdzt/jfjf/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.rsb_jfjf_cont2 ul li a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.includes('../../../')) {
                link = `${rootUrl}/SYrlzyhshbzb/${link.replace('../../../', '')}`;
            } else if (link.includes('./')) {
                link = `${currentUrl}/${link.replace('./', '')}`;
            }
            return {
                title: item.text(),
                link,
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

                item.description = content('#insMainConTxt').html() || content('.TRS_Editor').html() || content('#UCAP-CONTENT').html() || content('.weixinBox').html();
                item.pubDate = new Date(
                    content('meta[name="PubDate"]').attr('content') ||
                        content('meta[name="publishdate"]').attr('content') ||
                        (content('meta[name="firstpublishedtime"]').attr('content') ? content('meta[name="others"]').attr('content').replace('页面生成时间 ', '') : '')
                ).toUTCString();

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
