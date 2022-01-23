const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    let sid = ctx.params.sid ?? '';
    const tid = ctx.params.tid ?? '';

    sid = sid === 'recommend' ? '' : sid;

    const rootUrl = 'https://www.medsci.cn';
    const currentUrl = `${rootUrl}${sid ? `/department/details?s_id=${sid}&module=article${tid ? `&t_id=${tid}` : ''}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('#articleList')
        .find('.ms-link')
        .toArray()
        .map((item) => {
            item = $(item);

            const pubDate = item.parent().parent().find('.item-meta-item').first().text();

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href').replace(/;jsessionid=[A-Z0-9]+/, '')}`,
                pubDate: pubDate.indexOf('-') > 0 ? parseDate(pubDate) : parseRelativeDate(pubDate),
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

                const pubDateMatches = detailResponse.data.match(/"publishedTime":"(.*)","publishedTimeString"/);

                item.author = content('.name').text();
                item.description = content('#content').html();
                item.pubDate = pubDateMatches ? parseDate(pubDateMatches[1]) : item.pubDate;
                item.category =
                    content('meta[name="keywords"]')
                        .attr('content')
                        ?.split(/,|，/)
                        .filter((c) => c !== '' && c !== 'undefined') ?? [];

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${sid ? $('.department-header-active').text() : '推荐'} -${tid ? ` ${$('.department-keywords-ul .active').text()} -` : ''} MedSci.cn`,
        link: currentUrl,
        item: items,
    };
};
