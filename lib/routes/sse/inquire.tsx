import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/inquire',
    categories: ['finance'],
    example: '/sse/inquire',
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
            source: ['www.sse.com.cn/disclosure/credibility/supervision/inquiries', 'www.sse.com.cn/'],
        },
    ],
    name: '监管问询',
    maintainers: ['Jeason0228'],
    handler,
    url: 'www.sse.com.cn/disclosure/credibility/supervision/inquiries',
};

async function handler() {
    const refererUrl = 'https://www.sse.com.cn/disclosure/credibility/supervision/inquiries/';
    const response = await got('https://query.sse.com.cn/commonSoaQuery.do', {
        searchParams: {
            isPagination: true,
            'pageHelp.pageSize': 25,
            'pageHelp.pageNo': 1,
            'pageHelp.beginPage': 1,
            'pageHelp.cacheSize': 1,
            'pageHelp.endPage': 1,
            sqlId: 'BS_KCB_GGLL',
            siteId: 28,
            channelId: '10743,10744,10012',
            type: '',
            stockcode: '',
            extWTFL: '',
            order: 'createTime|desc,stockcode|asc',
            _: Date.now(),
        },
        headers: {
            Referer: refererUrl,
        },
    });

    const items = response.data.result.map((item) => ({
        title: item.extGSJC,
        description: renderToString(<SseInquireDescription item={item} />),
        pubDate: parseDate(item.createTime),
        link: `https://${item.docURL}`,
        author: item.extGSJC,
    }));

    return {
        title: '上海证券交易所 - 科创板股票审核',
        link: refererUrl,
        item: items,
    };
}

const SseInquireDescription = ({ item }: { item: any }) => (
    <table border="1">
        <tr>
            <td> 公司代码 : </td>
            <td>{item.stockcode}</td>
        </tr>
        <tr>
            <td> 公司简称 : </td>
            <td>{item.extGSJC}</td>
        </tr>
        <tr>
            <td> 发函日期 : </td>
            <td>{item.createTime}</td>
        </tr>
        <tr>
            <td> 监管问询类型 : </td>
            <td>{item.extWTFL}</td>
        </tr>
        <tr>
            <td> 标题 : </td>
            <td>
                <a href={`https://${item.docURL}`}>{item.docTitle}</a>
            </td>
        </tr>
    </table>
);
