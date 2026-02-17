import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/rszhaopin',
    categories: ['university'],
    example: '/bit/rszhaopin',
    parameters: {},
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
            source: ['rszhaopin.bit.edu.cn/'],
        },
    ],
    name: '人才招聘',
    maintainers: ['nczitzk'],
    handler,
    url: 'rszhaopin.bit.edu.cn/',
};

async function handler() {
    const rootUrl = 'https://rszhaopin.bit.edu.cn';
    const apiUrl = `${rootUrl}/ajax/ajaxService`;
    const currentUrl = `${rootUrl}/zp.html#/notices/0`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            __xml: 'A2GgW6kPrLjaqavT0I8o9cOIXCYxazGialM66OpRk0MhwwOeUI1mF8yRBJHzicA9uL8Y9gYrXjdMocslRUopTMDJSRAykGXsjUoPibT4uK8Rz8Zj7U00coBCcJibpVwRZzFk',
            __type: 'extTrans',
        },
    });

    const items = response.data.return_data.list.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: parseDate(item.createtime),
        link: `${rootUrl}/zp.html#/notice/${item.id}`,
    }));

    return {
        title: '人才招聘 - 北京理工大学',
        link: currentUrl,
        item: items,
    };
}
