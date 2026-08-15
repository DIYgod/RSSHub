import type { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjxx/:level?/:province?/:city?',
    categories: ['forecast'],
    example: '/cneb/yjxx',
    parameters: { level: '灾害级别，见下表，默认为全部', province: '省份，默认为空，即全国', city: '城市，默认为空，即全省' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cneb.gov.cn/yjxx', 'cneb.gov.cn/'],
            target: '/yjxx',
        },
    ],
    name: '预警信息',
    maintainers: ['muzea', 'nczitzk'],
    handler,
    url: 'cneb.gov.cn/yjxx',
    description: `灾害级别

| 全部 | 红色 | 橙色 | 黄色 | 蓝色 |
| ---- | ---- | ---- | ---- | ---- |
|      | 红色 | 橙色 | 黄色 | 蓝色 |

::: tip
若订阅全国的全部预警信息，此时路由为 [\`/cneb/yjxx\`](https://rsshub.app/cneb/yjxx)。

若订阅全国的 **红色** 预警信息，此时路由为 [\`/cneb/yjxx/红色\`](https://rsshub.app/cneb/yjxx/红色)。

若订阅 **北京市** 的全部预警信息，此时路由为 [\`/cneb/yjxx/北京市\`](https://rsshub.app/cneb/yjxx/北京市)。

若订阅 **北京市** 的 **蓝色** 预警信息，此时路由为 [\`/cneb/yjxx/北京市/蓝色\`](https://rsshub.app/cneb/yjxx/北京市/蓝色)。

若订阅 **广东省** 的 **橙色** 预警信息，此时路由为 [\`/cneb/yjxx/广东省/橙色\`](https://rsshub.app/cneb/yjxx/广东省/橙色)。

若订阅 **广东省广州市** 的全部预警信息，此时路由为 [\`/cneb/yjxx/广东省/广州市\`](https://rsshub.app/cneb/yjxx/广东省/广州市)。

若订阅 **广东省广州市** 的 **黄色** 预警信息，此时路由为 [\`/cneb/yjxx/广东省/广州市/黄色\`](https://rsshub.app/cneb/yjxx/广东省/广州市/黄色)。
:::`,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 200;

    const options = decodeURI(getSubPath(ctx))
        .replace(/\/yjxx/, '')
        .split('/');

    options.shift();

    const level = options.find((o) => /.*色$/.test(o)) ?? '';
    const locations = options.filter((o) => !/.*色$/.test(o)).slice(0, 2);

    const rootUrl = 'http://www.cneb.gov.cn';
    const apiRootUrl = 'https://gdapi.cnr.cn';

    const currentUrl = `${rootUrl}/yjxx`;
    const apiUrl = `${apiRootUrl}/yjwnews`;

    const title = `${locations.join('')}${level}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            size: limit,
            level: level ? `${level}预警` : '',
            province: locations.shift(),
            city: locations.shift(),
        },
    });

    const items = response.data.datas.map((item) => ({
        title: item.doctitle,
        link: item.docpuburl,
        author: item.chnlname,
        description: item.doccontent,
        pubDate: timezone(parseDate(item.docpubtime), 8),
    }));

    return {
        title: `国家应急广播 - ${title}预警信息`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
