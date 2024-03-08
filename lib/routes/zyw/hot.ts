import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/hot/:site?',
    categories: ['traditional-media'],
    example: '/zyw/hot',
    parameters: { site: '站点，见下表，默认为空，即全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '今日热榜',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site') ?? '';

    const rootUrl = 'https://hot.zyw.asia';
    const apiRootUrl = 'https://api-hot.zyw.asia';

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    const jsUrl = `${rootUrl}${response.data.match(/crossorigin src="(\/assets\/index-\w+\.js)">/)[1]}`;

    response = await got({
        method: 'get',
        url: jsUrl,
    });

    const sites = response.data
        .match(/label:"(.*?)",value:"(.*?)",order/g)
        .map((a) => {
            const matches = a.match(/label:"(.*?)",value:"(.*?)"/);
            return {
                label: matches[1],
                value: matches[2],
            };
        })
        .filter((a) => (site ? a.label === site || a.value === site : true));

    const currentUrl = `${rootUrl}${site ? `/#/list?type=${sites[0].value}` : ''}`;

    const items = [];

    await Promise.all(
        sites.map(async (a) => {
            const detailResponse = await got({
                method: 'get',
                url: `${apiRootUrl}/${a.value}`,
                headers: {
                    referer: rootUrl,
                },
            });

            for (const d of detailResponse.data.data) {
                items.push({
                    link: d.url,
                    title: d.title,
                    description: d.desc,
                });
            }

            return;
        })
    );

    return {
        title: `今日热榜${site ? ` - ${sites[0].label}` : ''}`,
        link: currentUrl,
        item: items,
    };
}
