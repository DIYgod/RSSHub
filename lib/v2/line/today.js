const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const edition = ctx.params.edition || 'tw';
    const tab = ctx.params.tab || 'top';

    const rootUrl = 'https://today.line.me';
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

    const list = response.data.items.map((item) => ({
        title: item.title,
        link: `${rootUrl}/${edition}/v2/article/${item.url.hash}`,
        pubDate: parseDate(item.publishTimeUnix),
        hash: item.url.hash,
        category: item.categoryName,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got({
                    method: 'get',
                    url: `${rootUrl}/webapi/portal/page/setting/article?country=${edition}&hash=${item.hash}&group=NA`,
                });

                const $ = cheerio.load(data.data.content, null, false);

                $('img').each((_, img) => {
                    delete img.attribs['data-hashid'];
                    img.attribs.src = img.attribs.src.replace(/\/w\d+$/, '');
                });

                item.description = $.html();
                item.author = data.data.author;
                item.category = [...new Set([item.category, ...data.data.exploreLinks.map((link) => link.name)])];

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
