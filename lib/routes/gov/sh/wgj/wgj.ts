import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: ['/sh/wgj/:page?', '/shanghai/wgj/:page?'],
    categories: ['government'],
    example: '/gov/sh/wgj',
    parameters: { page: '页数，默认第 1 页' },
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
            source: ['wsbs.wgj.sh.gov.cn/'],
            target: '/sh/wgj',
        },
    ],
    name: '上海市文旅局审批公告',
    maintainers: ['gideonsenku'],
    handler,
    url: 'wsbs.wgj.sh.gov.cn/',
};

async function handler(ctx) {
    const baseUrl = 'http://wsbs.wgj.sh.gov.cn';
    const currentUrl = `${baseUrl}/shwgj_ywtb/core/web/welcome/index!toResultNotice.action`;
    const page = ctx.req.param('page') ?? 1;
    const searchParams = {
        flag: 1,
        'pageDoc.pageNo': page,
    };
    const response = await got({
        method: 'post',
        url: currentUrl,
        searchParams,
    });

    const $ = load(response.data);
    const list = $('#div_md > table > tbody > tr > td:nth-child(1) > a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.prop('innerText').replaceAll(/\s/g, ''),
                link: item.attr('href'),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: baseUrl + item.link,
                });
                const $ = load(detailResponse.data);
                const dateElement = $('div[align="right"][style*="padding: 10px"]').last();
                const dateText = dateElement.text().trim();
                const hostingUnit = $('td:contains("举办单位：")').next().text().trim();
                const licenseNumber = $('td:contains("许可证号：")').next().text().trim();
                const performanceName = $('td:contains("演出名称:")').next().text().trim();
                const performanceDate = $('td:contains("演出日期：")').next().text().trim();
                const performanceVenue = $('td:contains("演出场所：")').next().text().trim();
                const mainActors = $('td:contains("主要演员：")').next().text().trim();
                const actorCount = $('td:contains("演员人数：")').next().text().trim();
                const showCount = $('td:contains("场次：")').next().text().trim();

                item.description = art(path.join(__dirname, './templates/wgj.art'), {
                    hostingUnit,
                    licenseNumber,
                    performanceName,
                    performanceDate,
                    performanceVenue,
                    mainActors,
                    actorCount,
                    showCount,
                });
                item.pubDate = parseDate(dateText);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
