const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const edition = ctx.params.edition || 'tw';
    const tab = ctx.params.tab || 'top';

    const rootUrl = 'https://today.line.me';
    const tabUrl = `${rootUrl}/api/v6/portals/${edition}/page/${tab}`;
    const recommendationUrl = `${rootUrl}/webapi/api/v6/recommendation/articles/listings/mytoday_rec:id?offset=0&length=50&country=${edition}&gender=&age=&excludeNoThumbnail=0&containMainSnapshot=0`;
    const currentUrl = `${rootUrl}/${edition}/v2/tab/${tab}`;

    let title = 'Recommendation',
        moduleUrl;

    if (tab !== 'recommendation') {
        const moduleResponse = await got({
            method: 'get',
            url: tabUrl,
        });

        const listing = moduleResponse.data.modules.filter((item) => item.source === 'CATEGORY_MOST_VIEW')[0].listings[0];

        title = moduleResponse.data.name;
        moduleUrl =
            `${rootUrl}/webapi/trending/category/mostView/listings/${listing.id}?` +
            `offset=0&length=50&country=${edition}&targetContent=${listing.params.targetContent}` +
            `&categories=${listing.params.categories}&trendingEventPeriod=${listing.params.trendingEventPeriod}`;
    }

    const response = await got({
        method: 'get',
        url: tab === 'recommendation' ? recommendationUrl : moduleUrl,
    });

    const list = response.data.items.map((item) => ({
        title: item.title,
        link: `${rootUrl}/${edition}/v2/article/${item.url.hash}`,
        pubDate: parseDate(item.publishTimeUnix),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('img').each(function () {
                    content(this).parent().find('.placeholder').remove();

                    content(this).attr('src', content(this).attr('data-src').replace('w644', 'w1200'));

                    content(this).removeAttr('data-src');
                    content(this).removeAttr('data-srcset');
                });

                content('iframe').each(function () {
                    content(this).attr('src', content(this).attr('data-src'));
                    content(this).removeAttr('data-src');
                });

                item.description = content('.articleContent').html();
                item.author = content('meta[property="author"]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${title} - Line Today`,
        link: currentUrl,
        item: items,
    };
};
