import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'http://wlwz.changsha.gov.cn';

export const route: Route = {
    path: '/hunan/changsha/major-email',
    categories: ['government'],
    example: '/gov/hunan/changsha/major-email',
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
            source: ['wlwz.changsha.gov.cn/webapp/cs2020/email/*'],
        },
    ],
    name: '长沙市人民政府',
    maintainers: ['shansing'],
    handler,
    url: 'wlwz.changsha.gov.cn/webapp/cs2020/email/*',
    description: `#### 市长信箱 {#hu-nan-sheng-ren-min-zheng-fu-chang-sha-shi-ren-min-zheng-fu-shi-zhang-xin-xiang}


可能仅限中国大陆服务器访问，以实际情况为准。`,
};

async function handler() {
    const listPage = await got('http://wlwz.changsha.gov.cn/webapp/cs2020/email/index.jsp', {
        responseType: 'buffer',
    });
    listPage.data = iconv.decode(listPage.data, 'gbk');
    const $ = load(listPage.data);
    const list = $('.table1 tbody tr')
        .slice(1)
        .map((_, tr) => {
            tr = $(tr);

            return {
                title: tr.find('td[title]').attr('title'),
                link: baseUrl + tr.find('td[title] > a').attr('href'),
                author: tr.find('td:last').text(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const postPage = await got(item.link, {
                    responseType: 'buffer',
                });
                postPage.data = iconv.decode(postPage.data, 'gbk');
                const $ = load(postPage.data);

                const data = {
                    title: item.title,
                    description: $('.letter-details').html().trim(),
                    pubDate: parseDate($('.letter-details div:first table tr:nth-child(2) > .td_label2').text() + ' +0800', 'YYYY-MM-DD HH:mm:ss ZZ'),
                    link: item.link,
                    author: item.author,
                };
                return data;
            })
        )
    );

    return {
        title: '来信反馈 - 长沙市市长信箱',
        link: `${baseUrl}/webapp/cs2020/email/index.jsp`,
        item: items,
    };
}
