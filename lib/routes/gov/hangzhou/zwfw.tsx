import { type CheerioAPI, load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import timezone from '@/utils/timezone';

import { analyzer, crawler } from './zjzwfw';

const renderDescription = ({ serviceInfo, applicationInfo, resultInfo, feeInfo, approvalInfo, deliveryInfo, agentService, otherInfo }) =>
    renderToString(
        <table>
            <tbody>
                <tr>
                    <th colspan={4}>办事信息</th>
                </tr>
                <tr>
                    <th>服务对象</th>
                    <td>{serviceInfo.serviceTarget}</td>
                    <th>办理形式</th>
                    <td>{serviceInfo.processingMethods}</td>
                </tr>
                <tr>
                    <th>办理地点</th>
                    <td colspan={3}>{serviceInfo.processingLocation}</td>
                </tr>
                <tr>
                    <th>办理时间</th>
                    <td colspan={3}>{serviceInfo.processingTime}</td>
                </tr>
                <tr>
                    <th colspan={4}>申请信息</th>
                </tr>
                <tr>
                    <th>受理条件</th>
                    <td colspan={3}>{applicationInfo.acceptanceConditions}</td>
                </tr>
                <tr>
                    <th>禁止性要求</th>
                    <td colspan={3}>{applicationInfo.prohibitedRequirements}</td>
                </tr>
                <tr>
                    <th>数量限制</th>
                    <td colspan={3}>{applicationInfo.quantityRestrictions}</td>
                </tr>
                <tr>
                    <th colspan={4}>结果信息</th>
                </tr>
                <tr>
                    <th>审批结果名称</th>
                    <td colspan={3}>{resultInfo.approvalResult}</td>
                </tr>
                <tr>
                    <th>审批结果样本</th>
                    <td>{resultInfo.approvalSample ? raw(resultInfo.approvalSample) : null}</td>
                    <th>审批结果类型</th>
                    <td>{resultInfo.approvalResultType}</td>
                </tr>
                <tr>
                    <th colspan={4}>收费信息</th>
                </tr>
                <tr>
                    <th>是否收费</th>
                    <td>{feeInfo.isThereAFee}</td>
                    <th>是否支持网上支付</th>
                    <td>{feeInfo.isOnlinePaymentSupported}</td>
                </tr>
                <tr>
                    <th colspan={4}>审批信息</th>
                </tr>
                <tr>
                    <th>权力来源</th>
                    <td colspan={3}>{approvalInfo.authoritySource}</td>
                </tr>
                <tr>
                    <th>行使层级</th>
                    <td>{approvalInfo.exerciseLevel}</td>
                    <th>实施主体性质</th>
                    <td>{approvalInfo.implementingEntity}</td>
                </tr>
                <tr>
                    <th colspan={4}>送达信息</th>
                </tr>
                <tr>
                    <th>是否支持物流快递</th>
                    <td>{deliveryInfo.isLogisticsSupported}</td>
                    <th>送达时限</th>
                    <td>{deliveryInfo.deliveryTimeframe}</td>
                </tr>
                <tr>
                    <th>送达方式</th>
                    <td colspan={3}>{deliveryInfo.deliveryMethods}</td>
                </tr>
                <tr>
                    <th colspan={4}>中介服务信息</th>
                </tr>
                <tr>
                    <th>中介服务事项名称</th>
                    <td colspan={3}>{agentService}</td>
                </tr>
                <tr>
                    <th colspan={4}>其他信息</th>
                </tr>
                <tr>
                    <th>部门名称</th>
                    <td>{otherInfo.departmentName}</td>
                    <th>事项类型</th>
                    <td>{otherInfo.matterType}</td>
                </tr>
                <tr>
                    <th>受理机构</th>
                    <td colspan={3}>{otherInfo.acceptingInstitution}</td>
                </tr>
                <tr>
                    <th>基本编码</th>
                    <td>{otherInfo.basicCode}</td>
                    <th>实施编码</th>
                    <td>{otherInfo.implementationCode}</td>
                </tr>
                <tr>
                    <th>通办范围</th>
                    <td>{otherInfo.scopeOfGeneralHandling}</td>
                    <th>办件类型</th>
                    <td>{otherInfo.documentType}</td>
                </tr>
                <tr>
                    <th>决定机构</th>
                    <td>{otherInfo.decisionMakingAuthority}</td>
                    <th>委托部门</th>
                    <td>{otherInfo.delegatedDepartment}</td>
                </tr>
                <tr>
                    <th>网上办理深度</th>
                    <td>{otherInfo.onlineProcessingDepth}</td>
                    <th>事项审查类型</th>
                    <td>{otherInfo.reviewType}</td>
                </tr>
                <tr>
                    <th>是否进驻政务大厅</th>
                    <td>{otherInfo.isItAvailableInTheGovernmentServiceHall}</td>
                    <th>是否支持自助终端办理</th>
                    <td>{otherInfo.isSelfServiceTerminalProcessingSupported}</td>
                </tr>
                <tr>
                    <th>是否实行告知承诺</th>
                    <td>{otherInfo.isACommitmentSystemImplemented}</td>
                    <th>权力属性</th>
                    <td>{otherInfo.authorityAttribute}</td>
                </tr>
                <tr>
                    <th>是否支持预约办理</th>
                    <td>{otherInfo.isAppointmentBookingSupported}</td>
                    <th>是否网办</th>
                    <td>{otherInfo.isOnlineProcessingAvailable}</td>
                </tr>
                <tr>
                    {otherInfo.legalPersonThemeClassification ? (
                        <>
                            <th>自然人主题分类</th>
                            <td>{otherInfo.naturalPersonThemeClassification}</td>
                            <th>法人主题分类</th>
                            <td>{otherInfo.legalPersonThemeClassification}</td>
                        </>
                    ) : (
                        <>
                            <th>自然人主题分类</th>
                            <td colspan={3}>{otherInfo.naturalPersonThemeClassification}</td>
                        </>
                    )}
                </tr>
                <tr>
                    <th>行政相对人权利和义务</th>
                    <td colspan={3}>{otherInfo.rightsAndObligationsOfAdministrativeCounterparties}</td>
                </tr>
                <tr>
                    <th>适用对象说明</th>
                    <td colspan={3}>{otherInfo.applicableObjectDescription}</td>
                </tr>
                <tr>
                    <th>涉及的内容</th>
                    <td colspan={3}>{otherInfo.contentInvolved}</td>
                </tr>
            </tbody>
        </table>
    );

export const route: Route = {
    path: '/zwfw',
    categories: ['government'],
    example: '/gov/hangzhou/zwfw',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hangzhou.gov.cn/col/col1256349/index.html'],
        },
    ],
    name: '政务服务公开',
    maintainers: ['flynncao'],
    handler,
    url: 'hangzhou.gov.cn/col/col1256349/index.html',
};

async function handler() {
    const host = 'https://www.hangzhou.gov.cn/col/col1256349/index.html';
    const response = await ofetch(host);

    const link = host;
    const formatted = response
        .replace('<script type="text/xml">', '')
        .replace('</script>', '')
        .replaceAll('<recordset>', '')
        .replaceAll('</recordset>', '')
        .replaceAll('<record>', '')
        .replaceAll('</record>', '')
        .replaceAll('<![CDATA[', '')
        .replaceAll(']]>', '');
    const $ = load(formatted);

    const list = $('li.clearfix')
        .toArray()
        .map((item: any) => {
            const $item = $(item);
            const title = $item.find('a').first().text();
            const dateText = $item.find('span').first().text();
            const time = dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD'), 8) : undefined;
            const a = $item.find('a').first().attr('href');
            const fullUrl = new URL(a!, host).href;

            return {
                title,
                link: fullUrl,
                pubDate: time,
            };
        })
        .filter((item) => !item.title.includes('置顶'));
    let context: Awaited<ReturnType<typeof playwright>> | undefined;
    try {
        const items: any = await pMap(
            list,
            (item: any) =>
                cache.tryGet(item.link, async () => {
                    const host = new URL(item.link).hostname;
                    let content: CheerioAPI;
                    if (host === 'www.zjzwfw.gov.cn') {
                        context ??= await playwright();
                        // Fetch Zhejiang government service details.
                        const response = await crawler(item, context);
                        content = load(response);
                        item.category = content('meta[name="ColumnType"]').attr('content');
                        item.description = renderDescription(analyzer(content('.item-left .item .bg_box')));
                        item.author = '浙江政务服务网';
                    } else {
                        // Fetch standard article details.
                        const response = await got(item.link);
                        content = load(response.data);
                        // Use the police article container when applicable.
                        item.description = host === 'police.hangzhou.gov.cn' ? content('.art-content .wz_con_content').html() : content('.article').html();
                        item.author = content('meta[name="ContentSource"]').attr('content');
                        item.category = content('meta[name="ColumnType"]').attr('content');
                    }
                    const pubDate = content('meta[name="PubDate"]').attr('content');
                    if (pubDate) {
                        item.pubDate = timezone(parseDate(pubDate, 'YYYY-MM-DD HH:mm'), 8);
                    }
                    return item;
                }),
            { concurrency: 1 }
        );

        return {
            title: '杭州市人民政府-政务服务公开',
            link,
            item: items,
        };
    } finally {
        await context?.close();
    }
}
