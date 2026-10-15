import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
const host = 'https://www.flyert.com.cn';
const target = `${host}/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322`;

export const route: Route = {
    path: '/preferential',
    categories: ['travel'],
    example: '/flyert/preferential',
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
            source: ['flyert.com/'],
        },
    ],
    name: '优惠信息',
    maintainers: ['howel52'],
    handler,
    url: 'www.flyert.com.cn/',
};

async function handler() {
    const response = await got(target, {
        responseType: 'buffer',
    });

    const $ = load(gbk2utf8(response.data));
    const list = $('.comiis_wzli')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('.wzbt').text(),
            link: `${host}/${$(item).find('.wzbt a').attr('href')}`,
            description: $(item).find('.wznr > div:first-child').text(),
        }));

    const items = await pMap(
        list,
        async (item): Promise<DataItem> => {
            const detail = await cache.tryGet(`flyert:preferential-body:${item.link}`, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });
                const content = load(gbk2utf8(detailResponse.data));

                // remove top ad
                content('div.artical_top').remove();

                return {
                    description: content('#artMain').html() ?? '',
                    pubDate: timezone(parseDate(content('p.xg1 > span:nth-child(1)').attr('title') || content('p.xg1').text().split('|', 1)[0], 'YYYY-M-D HH:mm'), 8),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );
    return {
        title: '飞客茶馆优惠',
        link: target,
        description: '飞客茶馆优惠',
        item: items,
    };
}
