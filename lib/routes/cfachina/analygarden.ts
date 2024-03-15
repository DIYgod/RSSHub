import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/servicesupport/analygarden/:program?',
    categories: ['other'],
    example: '/cfachina/servicesupport/analygarden',
    parameters: { program: '分类，见下表，留空为全部' },
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
            source: ['cfachina.org/servicesupport/analygarden/:program?', 'cfachina.org/'],
        },
    ],
    name: '分析师园地',
    maintainers: ['TonyRL'],
    handler,
    description: `| 有色金属类 | 黑色金属类 | 能源化工类 | 贵金属类 | 农产品类 | 金融类 | 指数类 |
  | ---------- | ---------- | ---------- | -------- | -------- | ------ | ------ |
  | ysjsl      | hsjsl      | nyhgl      | gjsl     | ncpl     | jrl    | zsl    |`,
};

async function handler(ctx) {
    let { program = '分析师园地' } = ctx.req.param();
    const baseUrl = 'https://www.cfachina.org';
    let pageData,
        pageUrl = `${baseUrl}/servicesupport/analygarden/`;

    if (program !== '分析师园地') {
        pageUrl = `${pageUrl}${program}/`;

        const response = await got(pageUrl);
        const $ = load(response.data);
        program = $('script:contains("Paging")')
            .text()
            .match(/var name = '(.+)';/)[1];
        pageData = {
            category: $('.crumb a')
                .toArray()
                .map((item) => $(item).text())
                .slice(-2),
        };
    }

    const { data: response } = await got(`${baseUrl}/qx-search/api/wcmSearch/getDataByProgram`, {
        headers: {
            accept: 'application/json, text/plain, */*',
        },
        searchParams: {
            pageNo: 1,
            pageSize: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20,
            keyword: '',
            startTime: '',
            endTime: '',
            type: '',
            programName: program,
        },
    });

    const items = response.data.dataList.map((item) => {
        const link = new URL(item.docPubUrl, baseUrl).href;
        return {
            title: item.docTitle,
            author: item.docAuthor,
            link,
            pubDate: timezone(parseDate(item.operTime), +8),
            enclosure_url: link,
            enclosure_type: `application/${link.split('.').pop()}`,
        };
    });

    return {
        title: `${pageData?.category.toReversed().join(' - ') ?? '分析师园地'} - 中国期货业协会`,
        link: pageUrl,
        item: items,
    };
}
