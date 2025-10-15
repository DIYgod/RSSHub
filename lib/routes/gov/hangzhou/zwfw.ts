import { Route } from '@/types';
import { load } from 'cheerio';

import puppeteer from '@/utils/puppeteer';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { crawler, analyzer } from './zjzwfw';
import timezone from '@/utils/timezone';
import path from 'node:path';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/hangzhou/zwfw',
    categories: ['government'],
    example: '/gov/hangzhou/zwfw',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hangzhou.gov.cn/col/col1256349/index.html'],
        },
    ],
    name: '政务服务公开',
    maintainers: ['flynncao'],
    handler,
    url: 'hangzhou.gov.cn/col/col1256349/index.html',
};

async function handler() {
    const host = 'https://www.hangzhou.gov.cn/col/col1256349/index.html';
    const response = await ofetch(host);

    const browser = await puppeteer();
    const link = host;
    const formatted = response
        .replace('<script type="text/xml">', '')
        .replace('</script>', '')
        .replaceAll('<recordset>', '')
        .replaceAll('</recordset>', '')
        .replaceAll('<record>', '')
        .replaceAll('</record>', '')
        .replaceAll('<![CDATA[', '')
        .replaceAll(']]>', '');
    const $ = load(formatted);

    const list = $('li.clearfix')
        .toArray()
        .map((item: any) => {
            item = $(item);
            const title = item.find('a').first().text();
            const time = timezone(parseDate(item.find('span').first().text(), 'YYYY-MM-DD'), 8);
            const a = item.find('a').first().attr('href');
            const fullUrl = new URL(a, host).href;

            return {
                title,
                link: fullUrl,
                pubDate: time,
            };
        })
        .filter((item) => !item.title.includes('置顶'));
    const items: any = await Promise.all(
        list.map((item: any) =>
            cache.tryGet(item.link, async () => {
                const host = new URL(item.link).hostname;
                if (host === 'www.zjzwfw.gov.cn') {
                    // 来源为浙江政务服务网
                    const content = await crawler(item, browser);
                    const $ = load(content);
                    item.description = art(path.resolve(__dirname, 'templates/jbxx.art'), analyzer($('.item-left .item .bg_box')));
                    item.author = '浙江政务服务网';
                    item.category = $('meta[name="ColumnType"]').attr('content');
                } else {
                    // 其他正常抓取
                    const response = await got(item.link);
                    const $ = load(response.data);
                    if (host === 'police.hangzhou.gov.cn') {
                        // 来源为杭州市公安局
                        item.description = $('.art-content .wz_con_content').html();
                        item.author = $('meta[name="ContentSource"]').attr('content');
                        item.category = $('meta[name="ColumnType"]').attr('content');
                    } else {
                        // 缺省：来源为杭州市政府网
                        item.description = $('.article').html();
                        item.author = $('meta[name="ContentSource"]').attr('content');
                        item.category = $('meta[name="ColumnType"]').attr('content');
                    }
                }
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content') as string, 'YYYY-MM-DD HH:mm'), 8) : item.pubDate;
                return item;
            })
        )
    );

    await browser.close();
    return {
        allowEmpty: true,
        title: '杭州市人民政府-政务服务公开',
        link,
        item: items,
    };
}
