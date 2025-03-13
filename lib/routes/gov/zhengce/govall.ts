import { Route } from '@/types';
import { parse } from 'querystring';
import axios from 'axios';

export const route: Route = {
    path: '/zhengce/:advance?',
    categories: ['government'],
    example: '/gov/zhengce/searchWord=医保',
    parameters: { advance: '高级搜索选项，将作为请求参数直接添加到url后。目前可用的选项仅searchWord，因为不同组合对应不同AthenaAppKey，出于稳定性和实用性考虑暂不实现。' },
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
            source: ['sousuo.www.gov.cn/'],
            target: '/zhengce',
        },
    ],
    name: '信息稿件',
    maintainers: ['ciaranchen', 'zll17'],
    handler,
    url: 'sousuo.www.gov.cn',
    description: `|  选项  |   意义   |  默认  |
| :-----------------------------: | :----------------------------------------------: | :----------------------------: |
|  searchWord      |    搜索关键词   |  ""  |
|  orderBy      |     time: 按发布时间排序；related: 按相关度排序   | time   |
|  searchBy   | title: 仅搜索标题；all: 搜索全文 |  title  |
|   granularity   |  ALL: 时间不限；LAST_WEEK: 一周内；LAST_MONTH: 一月内；LAST_YEAR: 一年内；CUSTOM: 自定义时间 | ALL |
|  beginDateTime  |  当granularity为CUSTOM时需添加  | yyyy-MM-dd   |
|  endDateTime  |  当granularity为CUSTOM时需添加  |  yyyy-MM-dd  |`,
};

async function fetchData(searchWord = '农业') {
    const response = await axios({
        method: 'post',
        url: 'https://sousuoht.www.gov.cn/athena/forward/2B22E8E39E850E17F95A016A74FCB6B673336FA8B6FEC0E2955907EF9AEE06BE',
        headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'zh-CN,zh;q=0.9,ru;q=0.8,en;q=0.7',
            AthenaAppKey: 'QLswV4i%2Br6EJk0udvQJoax2erH1NAH3CUcGuTvIeczjwvq28TC7AXoaYfa76nhzAEHYIjC%2Fh5lEHUJqKSUOdNtaOBi%2FUhQfVZI7u1PHes%2BhI%2B7GZ7tahykzv%2BFO4mCNorDViLTNranNi0axlXGzM0yTAgu%2FXBNJyaVd5SI89CIw%3D',
            AthenaAppName: '%E5%9B%BD%E7%BD%91%E6%90%9C%E7%B4%A2',
            Connection: 'keep-alive',
            'Content-Type': 'application/json;charset=UTF-8',
            Host: 'sousuoht.www.gov.cn',
            Origin: 'https://sousuo.www.gov.cn',
            'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        },
        data: JSON.stringify({
            code: '17da70961a7',
            historySearchWords: ['医保', '教育'],
            dataTypeId: '107',
            orderBy: 'time',
            searchBy: 'title',
            appendixType: '',
            granularity: 'ALL',
            trackTotalHits: true,
            beginDateTime: '',
            endDateTime: '',
            isSearchForced: 0,
            filters: [],
            pageNo: 1,
            pageSize: 20,
            customFilter: { operator: 'and', properties: [] },
            searchWord,
        }),
    });
    return response.data;
}

async function handler(ctx) {
    const advance = ctx.req.param('advance');
    const advanceParams = advance ? parse(advance) : {};
    const searchWord = advanceParams.searchWord || '';

    const link = `https://sousuo.www.gov.cn/sousuo/search.shtml`;

    const params = new URLSearchParams({
        code: '17da70961a7',
        dataTypeId: '107',
    });
    const query = `${params.toString()}&${advance}`;

    const res = await fetchData(searchWord);

    const list = res.result.data.middle.list.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: new Date(item.time).toISOString(), // 转换为ISO格式的时间字符串
        description: item.content,
    }));

    const items = await Promise.all(list.map((item) => item));

    return {
        title: '信息稿件 - 中国政府网',
        link: `${link}?${query}`,
        item: items,
    };
}
