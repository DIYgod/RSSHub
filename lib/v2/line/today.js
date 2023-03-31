const got = require('@/utils/got');
const { baseUrl: rootUrl, parseList, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const edition = ctx.params.edition || 'tw';
    const tab = ctx.params.tab || 'top';

    const tabUrl = `${rootUrl}/webapi/portal/page/${tab}?country=${edition}`;
    const recommendationUrl = `${rootUrl}/webapi/api/v6/recommendation/articles/listings/mytoday_rec:id?offset=0&length=50&country=${edition}&gender=&age=&excludeNoThumbnail=0&containMainSnapshot=0`;
    const currentUrl = `${rootUrl}/${edition}/v2/tab/${tab}`;

    let title = 'Recommendation',
        moduleUrl;

    if (tab !== 'recommendation') {
        const moduleResponse = await got({
            method: 'get',
            url: tabUrl,
        });

        const listing = moduleResponse.data.modules.filter((item) => item.source === 'CATEGORY_MOST_VIEW').pop().listings[0];

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

    const list = parseList(response.data.items);

    const items = await parseItems(list, ctx.cache.tryGet);

    ctx.state.data = {
        title: `${title} - Line Today`,
        link: currentUrl,
        item: items,
    };
};
