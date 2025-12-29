import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(localizedFormat);

const currStatusName = ['全部', '已受理', '已询问', '通过', '未通过', '提交注册', '补充审核', '注册结果', '中止', '终止'];

export const route: Route = {
    path: '/renewal',
    categories: ['finance'],
    example: '/sse/renewal',
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
            source: ['kcb.sse.com.cn/home', 'kcb.sse.com.cn/'],
        },
    ],
    name: '科创板项目动态',
    maintainers: ['Jeason0228'],
    handler,
    url: 'kcb.sse.com.cn/home',
};

async function handler() {
    const pageUrl = 'https://kcb.sse.com.cn/renewal/';
    const host = `https://kcb.sse.com.cn`;

    const response = await got('https://query.sse.com.cn/statusAction.do', {
        searchParams: {
            isPagination: true,
            sqlId: 'SH_XM_LB',
            'pageHelp.pageSize': 20,
            offerType: '',
            commitiResult: '',
            registeResult: '',
            province: '',
            csrcCode: '',
            currStatus: '',
            order: 'updateDate|desc,stockAuditNum|desc',
            keyword: '',
            auditApplyDateBegin: '',
            auditApplyDateEnd: '',
            _: Date.now(),
        },
        headers: {
            Referer: pageUrl,
        },
    });

    // console.log(response.data.result);
    const items = response.data.result.map((item) => ({
        title: `【${currStatusName[item.currStatus]}】${item.stockAuditName}`,
        description: renderToString(
            <SseRenewalDescription
                item={item}
                currStatus={currStatusName[item.currStatus]}
                updateDate={dayjs(item.updateDate, 'YYYYMMDDHHmmss').locale('zh-cn').format('lll')}
                auditApplyDate={dayjs(item.auditApplyDate, 'YYYYMMDDHHmmss').locale('zh-cn').format('lll')}
            />
        ),
        pubDate: parseDate(item.updateDate, 'YYYYMMDDHHmmss'),
        link: `${host}/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}`,
        author: item.stockAuditName,
    }));

    return {
        title: '上海证券交易所 - 科创板项目动态',
        link: pageUrl,
        item: items,
    };
}

const SseRenewalDescription = ({ item, currStatus, updateDate, auditApplyDate }: { item: any; currStatus: string; updateDate: string; auditApplyDate: string }) => (
    <table>
        <tr>
            <th id="stockIssuer" desc="发行人全称">
                发行人全称
            </th>
            <td>{item.stockAuditName}</td>
        </tr>
        <tr>
            <th id="currStatus" desc="审核状态">
                审核状态
            </th>
            <td>{currStatus}</td>
        </tr>
        <tr>
            <th id="s_province" desc="注册地">
                注册地
            </th>
            <td>{item.stockIssuer[0].s_province}</td>
        </tr>
        <tr>
            <th id="s_csrcCodeDesc" desc="证监会行业">
                证监会行业
            </th>
            <td>{item.stockIssuer[0].s_csrcCodeDesc}</td>
        </tr>
        <tr>
            <th id="intermediary" desc="保荐机构">
                保荐机构
            </th>
            <td>{item.intermediary[0].i_intermediaryName}</td>
        </tr>
        <tr>
            <th id="intermediary" desc="律师事务所">
                律师事务所
            </th>
            <td>{item.intermediary[2].i_intermediaryName}</td>
        </tr>
        <tr>
            <th id="intermediary" desc="会计师事务所">
                会计师事务所
            </th>
            <td>{item.intermediary[1].i_intermediaryName}</td>
        </tr>
        {item.intermediary[3] ? (
            <tr>
                <th id="intermediary" desc="评估机构">
                    评估机构
                </th>
                <td>{item.intermediary[3].i_intermediaryName}</td>
            </tr>
        ) : null}
        <tr>
            <th id="updateDate" desc="更新日期">
                更新日期
            </th>
            <td>{updateDate}</td>
        </tr>
        <tr>
            <th id="auditApplyDate" desc="受理日期">
                受理日期
            </th>
            <td>{auditApplyDate}</td>
        </tr>
        <tr>
            <th>详细链接</th>
            <td>
                <a href={`http://kcb.sse.com.cn/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}`}>查看详情</a>
            </td>
        </tr>
    </table>
);
