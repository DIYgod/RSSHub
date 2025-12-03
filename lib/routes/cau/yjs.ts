import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/cau/yjs',
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
            source: ['yz.cau.edu.cn/col/col41740/index.html', 'yz.cau.edu.cn/'],
        },
    ],
    name: '研招网通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.cau.edu.cn/col/col41740/index.html',
};

async function handler() {
    const baseUrl = 'https://yz.cau.edu.cn';
    const link = `${baseUrl}/col/col41740/index.html`;
    const response = await got(`${baseUrl}/module/web/jpage/dataproxy.jsp`, {
        searchParams: {
            page: 1,
            appid: 1,
            webid: 146,
            path: '/',
            columnid: 41740,
            unitid: 69493,
            webname: '中国农业大学研究生院',
            permissiontype: 0,
        },
    });
    const $ = load(response.data);
    const list = $('recordset record');

    return {
        title: '中农研究生学院',
        link,
        description: '中农研究生学院',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(item.find('span').text().replaceAll(/[[\]]/g, '')),
                };
            }),
    };
}
