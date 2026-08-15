import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/zcwj',
    categories: ['government'],
    example: '/gov/miit/zcwj',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '政策文件',
    maintainers: ['Yoge-Code', 'hutianyu2006'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.miit.gov.cn';
    const apiUrl = `${rootUrl}/search-front-server/api/search/info`;

    const response = await got(apiUrl, {
        headers: {
            referer: `${rootUrl}/search/zcwjk.html`,
        },
        searchParams: {
            scope: 'basic',
            pos: 'title_text,infocontent,titlepy',
            cateid: 196, // NOTE: Not so clear about other magic ids, temporarily hardcoded
            p: 1,
            pg: 10,
            level: 6,
            dateField: 'deploytime',
            selectFields: 'title,content,deploytime,url,columnname,publishgroupname',
            sortFields: JSON.stringify([{ name: 'deploytime', type: 'desc' }]),
            group: 'distinct',
            highlightConfigs: JSON.stringify([{ field: 'infocontent', numberOfFragments: 2, fragmentOffset: 0, fragmentSize: 30, noMatchSize: 145 }]),
            highlightFields: 'infocontent',
        },
    });

    const result = response.data;
    const dataList = result.data.searchResult.dataResults;

    const items = dataList.map((item: any) => {
        const data = item.groupData?.[0].data ?? {};
        return {
            title: data.title,
            link: new URL(data.url, rootUrl).href,
            description: data.infocontent || data.title,
            pubDate: parseDate(Number(data.deploytime || data.publishtime)),
            author: data.publishgroupname,
        };
    });

    return {
        title: '中国工业和信息化部',
        link: 'http://www.miit.gov.cn',
        description: '政策文件',
        item: items,
    };
}
