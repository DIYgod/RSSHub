import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjxx/*',
    radar: [
        {
            source: ['cneb.gov.cn/yjxx', 'cneb.gov.cn/'],
            target: '/yjxx',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'cneb.gov.cn/yjxx',
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
        pubDate: timezone(parseDate(item.docpubtime), +8),
    }));

    return {
        title: `国家应急广播 - ${title}预警信息`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
