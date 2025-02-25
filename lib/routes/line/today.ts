import { Route } from '@/types';
import got from '@/utils/got';
import { baseUrl as rootUrl, parseList, parseItems } from './utils';

export const route: Route = {
    path: '/today/:edition?/:tab?',
    categories: ['new-media', 'popular'],
    example: '/line/today',
    parameters: { edition: 'Edition, see below, Taiwan by default', tab: 'Tag, can be found in URL, `top` by default' },
    radar: [
        {
            source: ['today.line.me/'],
        },
    ],
    name: 'TODAY',
    maintainers: ['nczitzk'],
    handler,
    url: 'today.line.me/',
    description: `Edition

| Taiwan | Thailand | Hong Kong |
| ------ | -------- | --------- |
| tw     | th       | hk        |`,
};

async function handler(ctx) {
    const edition = ctx.req.param('edition') || 'tw';
    const tab = ctx.req.param('tab') || 'top';

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

        const listing = moduleResponse.data.modules.findLast((item) => item.source === 'CATEGORY_MOST_VIEW').listings[0];

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

    const items = await parseItems(list);

    return {
        title: `${title} - Line Today`,
        link: currentUrl,
        item: items,
    };
}
