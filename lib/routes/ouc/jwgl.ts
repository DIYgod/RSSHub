import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwgl',
    categories: ['university'],
    example: '/ouc/jwgl',
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
            source: ['jwgl.ouc.edu.cn/cas/login.action', 'jwgl.ouc.edu.cn/public/SchoolNotice.jsp'],
        },
    ],
    name: '选课信息教务通知',
    maintainers: ['3401797899'],
    handler,
    url: 'jwgl.ouc.edu.cn/cas/login.action',
    description: `::: warning
  由于选课通知仅允许校园网访问，需自行部署。
:::`,
};

async function handler() {
    const link = 'http://jwgl.ouc.edu.cn/public/listSchoolNotices.action?currentPage=1&recordsPerPage=15&qtitle=';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('div.datalist table tbody tr')
        .toArray()
        .map((e) => {
            e = $(e);
            const noticeId = e
                .find('a')
                .attr('onclick')
                .match(/viewNotice\('(.+?)'\)/)[1];
            const tds = e.find('td');
            return {
                title: tds.eq(2).text(),
                link: 'http://jwgl.ouc.edu.cn/public/viewSchoolNoticeDetail.action?schoolNoticeId=' + noticeId,
                pubDate: parseDate(tds.eq(3).text(), 'YYYY-MM-DD HH:mm'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('div.notice').html();
                return item;
            })
        )
    );

    return {
        title: '中国海洋大学选课信息教务通知',
        link,
        description: '中国海洋大学选课信息教务通知',
        item: out,
    };
}
