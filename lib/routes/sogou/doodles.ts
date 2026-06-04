import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/doodles',
    categories: ['other'],
    example: '/sogou/doodles',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '特色 LOGO',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'http://help.sogou.com/logo/doodle_logo_list.html',
    });

    const data = response.data.split(/\r\n/).slice(1);

    return {
        title: '搜狗特色LOGO',
        link: 'http://help.sogou.com/logo/',
        item: data.map((item) => {
            item = item.split(',');

            return {
                title: `${item[2]}-${item[5]}`,
                description: `<img src="${item[4]}">`,
                pubDate: new Date(item[5]).toUTCString(),
                link: item[7],
                guid: item[4],
            };
        }),
    };
}
