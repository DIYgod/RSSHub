import { Route } from '@/types';
import { load } from 'cheerio';
const __dirname = getCurrentPath(import.meta.url);

import puppeteer from '@/utils/puppeteer';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { zjzwfwCrawler } from './crawler';
import timezone from '@/utils/timezone';
import path from 'node:path';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';

export const route: Route = {
    path: '/hangzhou/zwfw',
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

    const browser = await puppeteer({ stealth: true });
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
        .map((item) => {
            item = $(item);
            const title = item.find('a').first().text();
            const time = timezone(parseDate(item.find('span').first().text(), 'YYYY-MM-DD'), 8);
            const a = item.find('a').first().attr('href');
            const fullUrl = new URL(a, host).href;

            return {
                title,
                link: fullUrl,
                pubDate: time,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const host = new URL(item.link).hostname;
                if (host === 'www.zjzwfw.gov.cn') {
                    // 来源为浙江政务服务网
                    const content = await zjzwfwCrawler(item, browser);
                    const $ = load(content);
                    const box = $('.item-left .item .bg_box');
                    const basicInfo = {
                        serviceInfo: {
                            serviceTarget: $(box).find('.row:nth(1)>div:nth(1)').find('.inner').children().first().attr('content'),
                            processingMethods: $(box).find('.row:nth(1)>div:nth(3)').find('.inner').text(),
                            processingLocation: $(box).find('.row:nth(2)>div:nth(1)').find('.inner').text(),
                            processingTime: $(box).find('.row:nth(3)>div:nth(1)').find('.inner').text(),
                        },
                        applicationInfo: {
                            acceptanceConditions: $(box).find('.row:nth(5)>div:nth(1)').find('.inner').text(),
                            prohibitedRequirements: $(box).find('.row:nth(6)>div:nth(1)').find('.inner').text(),
                            quantityRestrictions: $(box).find('.row:nth(7)>div:nth(1)').find('.inner').text(),
                        },
                        resultInfo: {
                            approvalResult: $(box).find('.row:nth(9)>div:nth(1)').find('.inner').text(),
                            approvalSample: $(box).find('.row:nth(10)>div:nth(1)').find('.inner').html(),
                            approvalResultType: $(box).find('.row:nth(10)>div:nth(3)').find('.inner').text(),
                        },
                        feeInfo: {
                            isThereAFee: $(box).find('.row:nth(12)>div:nth(1)').find('.inner').text(),
                            isOnlinePaymentSupported: $(box).find('.row:nth(12)>div:nth(3)').find('.inner').text(),
                        },
                        approvalInfo: {
                            authoritySource: $(box).find('.row:nth(14)>div:nth(1)').find('.inner').text(),
                            exerciseLevel: $(box).find('.row:nth(15)>div:nth(1)').find('.inner').text(),
                            implementingEntity: $(box).find('.row:nth(15)>div:nth(3)').find('.inner').text(),
                        },
                        deliveryInfo: {
                            isLogisticsSupported: $(box).find('.row:nth(17)>div:nth(1)').find('.inner').text(),
                            deliveryTimeframe: $(box).find('.row:nth(17)>div:nth(3)').find('.inner').text(),
                            deliveryMethods: $(box).find('.row:nth(18)>div:nth(1)').find('.inner').text(),
                        },
                        agentService: $(box).find('.row:nth(20)>div:nth(1)').find('.inner').text(),
                        otherInfo: {
                            departmentName: $(box).find('.row:nth(22)>div:nth(1)').find('.inner').text(),
                            matterType: $(box).find('.row:nth(22)>div:nth(3)').find('.inner').text(),
                            acceptingInstitution: $(box).find('.row:nth(23)>div:nth(1)').find('.inner').text(),
                            basicCode: $(box).find('.row:nth(24)>div:nth(1)').find('.inner').text(),
                            implementationCode: $(box).find('.row:nth(24)>div:nth(3)').find('.inner').text(),
                            scopeOfGeneralHandling: $(box).find('.row:nth(25)>div:nth(1)').find('.inner').text(),
                            documentType: $(box).find('.row:nth(25)>div:nth(3)').find('.inner').text(),
                            decisionMakingAuthority: $(box).find('.row:nth(26)>div:nth(1)').find('.inner').text(),
                            delegatedDepartment: $(box).find('.row:nth(26)>div:nth(3)').find('.inner').text(),
                            onlineProcessingDepth: $(box).find('.row:nth(27)>div:nth(1)').find('.inner').text(),
                            reviewType: $(box).find('.row:nth(27)>div:nth(3)').find('.inner').text(),
                            isItAvailableInTheGovernmentServiceHall: $(box).find('.row:nth(28)>div:nth(1)').find('.inner').text(),
                            isSelfServiceTerminalProcessingSupported: $(box).find('.row:nth(28)>div:nth(3)').find('.inner').text(),
                            isACommitmentSystemImplemented: $(box).find('.row:nth(29)>div:nth(1)').find('.inner').text(),
                            authorityAttribute: $(box).find('.row:nth(29)>div:nth(3)').find('.inner').text(),
                            isAppointmentBookingSupported: $(box).find('.row:nth(30)>div:nth(1)').find('.inner').text(),
                            isOnlineProcessingAvailable: $(box).find('.row:nth(30)>div:nth(3)').find('.inner').text(),
                            naturalPersonThemeClassification: $(box).find('.row:nth(31)>div:nth(1)').find('.inner').text(),
                            legalPersonThemeClassification: $(box).find('.row:nth(31)>div:nth(3)').find('.inner').text(),
                            rightsAndObligationsOfAdministrativeCounterparties: $(box).find('.row:nth(32)>div:nth(1)').find('.inner').text(),
                            applicableObjectDescription: $(box).find('.row:nth(33)>div:nth(1)').find('.inner').text(),
                            contentInvolved: $(box).find('.row:nth(34)>div:nth(1)').find('.inner').text(),
                        },
                    };
                    item.description = art(path.resolve(__dirname, 'templates/jbxx.art'), basicInfo);
                    item.author = '浙江政务服务网';
                    item.category = $('meta[name="ColumnType"]').attr('content');
                } else {
                    // 其他正常抓取
                    const response = await got(item.link);
                    const $ = load(response.data);
                    if (host === 'police.hangzhou.gov.cn') {
                        // 来源为杭州市公安局
                        item.description = $('.art-content .wz_con_content').html();
                        item.author = $('meta[name="ContentSource"]').attr('content');
                        item.category = $('meta[name="ColumnType"]').attr('content');
                    } else {
                        // 缺省：来源为杭州市政府网
                        item.description = $('.article').html();
                        item.author = $('meta[name="ContentSource"]').attr('content');
                        item.category = $('meta[name="ColumnType"]').attr('content');
                    }
                }
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content') as string, 'YYYY-MM-DD HH:mm'), 8) : item.pubDate;
                return item;
            })
        )
    );

    await browser.close();
    return {
        allowEmpty: true,
        title: '杭州市人民政府-政务服务公开',
        link,
        item: items,
    };
}
