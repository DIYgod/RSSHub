import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const nodes = {
    important_news: {
        id: 1289,
        title: '本所要闻',
        url: '/news/important_news.html',
        type: '/info/listse',
    },
    recruit: {
        id: 1380,
        title: '人才招聘',
        url: '/company/recruit.html',
        type: '/info/listse',
    },
    purchase: {
        id: 1381,
        title: '采购信息',
        url: '/purchase/list.html',
        type: '/info/listse',
    },
    news_list: {
        id: 2676,
        title: '业务通知',
        url: '/news/news_list.html',
        type: '/info/listse',
    },
    law_list: {
        id: 1322,
        title: '法律法规',
        url: '/rule/law_list.html',
        type: '/info/listse',
    },
    public_opinion: {
        id: 1307,
        title: '公开征求意见',
        url: '/rule/public_opinion.html',
        type: '/info/listse',
    },
    regulation_list: {
        id: 1300,
        title: '部门规章',
        url: '/rule/regulation_list.html',
        type: '/info/listse',
    },
    fxrz_list: {
        id: 1302,
        title: '发行融资',
        url: '/business/fxrz_list.html',
        type: '/info/listse',
    },
    cxjg_list: {
        id: 1303,
        title: '持续监管',
        url: '/business/cxjg_list.html',
        type: '/info/listse',
    },
    jygl_list: {
        id: 1304,
        title: '交易管理',
        url: '/business/jygl_list.html',
        type: '/info/listse',
    },
    scgl_list: {
        id: 1306,
        title: '市场管理',
        url: '/business/scgl_list.html',
        type: '/info/listse',
    },
    meeting_notice: {
        id: '9531-1001',
        title: '上市委会议公告',
        url: '/notice/meeting_notice.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    meeting_result: {
        id: '9531-1002',
        title: '上市委会议结果公告',
        url: '/notice/meeting_result.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    meeting_change: {
        id: '9531-1003',
        title: '上市委会议变更公告',
        url: '/notice/meeting_notice.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    bgcz_notice: {
        id: '9536-1001',
        title: '并购重组委会议公告',
        url: '/notice/bgcz_notice.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    bgcz_result: {
        id: '9536-1002',
        title: '并购重组委会议结果公告',
        url: '/notice/bgcz_result.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    bgcz_change: {
        id: '9536-1003',
        title: '并购重组委会议变更公告',
        url: '/notice/bgcz_notice.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    termination_audit: {
        id: '9530-3001',
        title: '终止审核',
        url: '/notice/termination_audit.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
    audit_result: {
        id: '9532-1001',
        title: '注册结果',
        url: '/notice/audit_result.html',
        type: '/disclosureInfoController/zoneInfoResult',
    },
};

export const route: Route = {
    path: '/:category?/:keyword?',
    categories: ['finance'],
    example: '/bse',
    parameters: { category: '分类，见下表，默认为本所要闻', keyword: '关键字，默认为空' },
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
            source: ['bse.cn/'],
        },
    ],
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    url: 'bse.cn/',
    description: `| 本所要闻        | 人才招聘 | 采购信息 | 业务通知   |
| --------------- | -------- | -------- | ---------- |
| important_news | recruit  | purchase | news_list |

| 法律法规  | 公开征求意见    | 部门规章         | 发行融资   |
| --------- | --------------- | ---------------- | ---------- |
| law_list | public_opinion | regulation_list | fxrz_list |

| 持续监管   | 交易管理   | 市场管理   | 上市委会议公告  |
| ---------- | ---------- | ---------- | --------------- |
| cxjg_list | jygl_list | scgl_list | meeting_notice |

| 上市委会议结果公告 | 上市委会议变更公告 | 并购重组委会议公告 |
| ------------------ | ------------------ | ------------------ |
| meeting_result    | meeting_change    | bgcz_notice       |

| 并购重组委会议结果公告 | 并购重组委会议变更公告 | 终止审核           | 注册结果      |
| ---------------------- | ---------------------- | ------------------ | ------------- |
| bgcz_result           | bgcz_change           | termination_audit | audit_result |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'important_news';
    const keyword = ctx.req.param('keyword') ?? '';

    const type = nodes[category].type;
    const rootUrl = 'http://www.bse.cn';
    const currentUrl = `${rootUrl}${type}.do`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        form: {
            page: 0,
            pageSize: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50,
            keywords: keyword,
            'nodeIds[]': type === '/info/listse' ? nodes[category].id : undefined,
            disclosureSubtype: type === '/info/listse' ? undefined : nodes[category].id,
        },
    });

    const data = JSON.parse(response.data.match(/null\(\[({.*})]\)/)[1]);

    let items: DataItem[];

    switch (type) {
        case '/info/listse':
            items = data.data.content.map((item) => ({
                title: item.title,
                category: item.tags,
                description: item.text,
                link: `${rootUrl}${item.htmlUrl}`,
                pubDate: timezone(parseDate(item.publishDate), +8),
            }));
            break;

        case '/disclosureInfoController/zoneInfoResult':
            items = data.listInfo.content.map((item) => ({
                title: item.disclosureTitle,
                link: `${rootUrl}${item.destFilePath}`,
                pubDate: parseDate(item.pubDate.time),
            }));
            break;

        default:
            throw new Error(`Unknown type: ${type}`);
    }

    return {
        title: `${nodes[category].title} - 北京证券交易所`,
        link: `${rootUrl}${nodes[category].url}`,
        item: items,
        allowEmpty: true,
    };
}
