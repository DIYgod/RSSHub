const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { fetchArticle } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const num = ctx.params.num ?? '';

    const rootUrl = 'https://www.gs.sjtu.edu.cn';
    const currentUrl = `${rootUrl}/announcement/${type}/${num}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('a.announcement-item')
        .map((_, item) => {
            item = $(item);

            const day = item.find('.day').text().trim().replace('.', '-');
            const year = item.find('.month').text().trim();

            return {
                title: item.find('.title').text().trim(),
                link: `${item.attr('href').startsWith('http') ? '' : rootUrl}${item.attr('href')}`,
                pubDate: timezone(parseDate(`${year}-${day}`, 'YYYY-MM-DD'), +8),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    item.description = (await fetchArticle(ctx, item.link)).description;
                } else {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.page-content').html();
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${num === '' ? '' : `${$('.category-nav-block .active').text().trim()} - `}${$('div.inner-banner-text .title').text().trim()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};
