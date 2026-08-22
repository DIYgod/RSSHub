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
            selectFields: 'title,content,deploytime,url,columnname,publishgroupname,infoextends',
            sortFields: JSON.stringify([{ name: 'deploytime', type: 'desc' }]),
            group: 'distinct',
        },
    });

    const result = response.data;
    const dataList = result.data.searchResult.dataResults;

    const items = dataList
        .map((item: any) => {
            const data = item.groupData?.[0].data ?? {};
            const extendedInfo = data.infoextends ? JSON.parse(data.infoextends) : {};
            const infoContent = extendedInfo.infoContent ? JSON.parse(extendedInfo.infoContent) : {};
            return {
                title: data.title,
                link: data.url ? new URL(data.url, rootUrl).href : '',
                description: infoContent[0]?.fieldValue || '',
                pubDate: data.deploytime ? parseDate(Number(data.deploytime)) : undefined,
                author: data.publishgroupname,
            };
        })
        .filter((item: any) => item.link);

    return {
        title: '中国工业和信息化部',
        link: 'http://www.miit.gov.cn',
        description: '政策文件',
        item: items,
    };
}
