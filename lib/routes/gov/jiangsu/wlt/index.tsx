import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jiangsu/wlt/:page?',
    categories: ['government'],
    example: '/gov/jiangsu/wlt',
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
            source: ['wlt.jiangsu.gov.cn/'],
            target: '/jiangsu/wlt',
        },
    ],
    name: '江苏文旅局审批公告',
    maintainers: ['GideonSenku'],
    handler,
    url: 'wlt.jiangsu.gov.cn/',
};

async function handler(ctx) {
    const baseUrl = 'http://58.213.82.179:18080/jsswlt_sgs/front';
    const currentUrl = `${baseUrl}/list.do`;
    const page = ctx.req.param('page') ?? 1;
    const searchParams = {
        type: 0,
        pageNo0: page,
    };
    const response = await got({
        method: 'get',
        url: currentUrl,
        searchParams,
    });

    const $ = load(response.data);
    const list = $('.tg_tb1')
        .toArray()
        .map((item) => {
            const i = $(item);
            const id = i.prop('onclick').match(/openDetail\('(\d+)'\)/)?.[1] || '';
            return {
                title: i.text(),
                link: id ? `${baseUrl}/detail.do?iid=${id}` : '',
                description: '',
                pubDate: '',
            };
        })
        .filter((e) => e.link);
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(detailResponse.data);
                const dateText = $('td:contains("许可决定日期")').next().text().trim();
                const hostingUnit = $('td:contains("行政相对人名称")').next().text().trim();
                const licenseNumber = $('td:contains("行政许可决定文书号")').next().text().trim();
                const performanceName = $('td:contains("项目名称")').next().text().trim();
                const performanceContent = $('td:contains("许可内容")').next().text().trim();

                item.description = renderToString(
                    <>
                        <text>许可日期：{dateText} </text>
                        <br />
                        <text>行政名称：{hostingUnit} </text>
                        <br />
                        <text>许可编号：{licenseNumber} </text>
                        <br />
                        <text>项目名称：{performanceName} </text>
                        <br />
                        <text>许可内容：{performanceContent} </text>
                    </>
                );
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
