import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import got from '@/utils/got';

const rootUrl = 'http://www.rsj.sh.gov.cn';

const renderDescription = ({ name, type, date, registrationDeadline }) =>
    renderToString(
        <>
            <text>考试项目名称：{name} </text>
            <br />
            <text>考试类别：{type} </text>
            <br />
            <text>考试日期：{date} </text>
            <br />
            <text>报名起止日期：{registrationDeadline} </text>
        </>
    );

export const route: Route = {
    path: ['/sh/rsj/ksxm', '/shanghai/rsj/ksxm'],
    categories: ['government'],
    example: '/gov/sh/rsj/ksxm',
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
            source: ['rsj.sh.gov.cn/'],
        },
    ],
    name: '上海市职业能力考试院 考试项目',
    maintainers: ['Fatpandac'],
    handler,
    url: 'rsj.sh.gov.cn/',
};

async function handler() {
    const url = `${rootUrl}/ksyzc/wangz/kwaplist_300.jsp`;

    const response = await got({
        method: 'get',
        url,
        responseType: 'buffer',
    });
    const dataHtml = iconv.decode(response.data, 'gbk');
    const $ = load(dataHtml);

    const items = $('kwap')
        .toArray()
        .map((item) => ({
            title: $(item).find('kaosxmmc').text(),
            link: `http://www.rsj.sh.gov.cn/ksyzc/index801.jsp`,
            description: renderDescription({
                name: $(item).find('kaosxmmc').text(),
                type: $(item).find('kaoslb_dmfy').text(),
                date: $(item).find('kaosrq').text(),
                registrationDeadline: $(item).find('baomksrq_A300').text(),
            }),
            guid: `${$(item).find('kaosrq').text()}${$(item).find('kaosxmmc').text()}`,
        }));

    return {
        title: '上海市职业能力考试院 - 考试项目',
        link: url,
        item: items,
    };
}
