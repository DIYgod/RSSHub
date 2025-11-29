import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zw/projectList',
    categories: ['other'],
    example: '/cdzjryb/zw/projectList',
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
            source: ['zw.cdzjryb.com/lottery/accept/projectList', 'zw.cdzjryb.com/'],
        },
    ],
    name: '商品住房购房登记',
    maintainers: ['TonyRL'],
    handler,
    url: 'zw.cdzjryb.com/lottery/accept/projectList',
};

async function handler() {
    const url = 'https://zw.cdzjryb.com/lottery/accept/projectList';
    const { data: response } = await got(url);
    const $ = load(response);

    const list = $('#_projectInfo tr')
        .toArray()
        .map((item) =>
            $(item)
                .find('td')
                .toArray()
                .map((td) => $(td).text().trim())
        );

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(`cdzjryb:zw:projectList${item[0]}`, async () => {
                const { data: notice } = await got.post('https://zw.cdzjryb.com/lottery/accept/getProjectRule', {
                    form: {
                        projectUuid: item[0],
                    },
                });
                return {
                    title: item[3],
                    description: art(path.join(__dirname, 'templates/projectList.art'), {
                        item,
                        notice: notice.message,
                    }),
                    link: url,
                    guid: `cdzjryb:zw:projectList:${item[0]}`,
                    pubDate: timezone(parseDate(item[8]), 8),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        item: items,
    };
}
