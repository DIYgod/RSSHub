import { load } from 'cheerio';
import { html } from 'hono/html';
import pMap from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface TenderRow {
    subject: string;
    syncId: string;
    syncTime?: string;
    beginTime?: string;
    shopTypeName?: string;
}

interface Requirement {
    name: string;
    remark?: string;
}

interface PurchaseItem {
    name: string;
    applyNums?: number;
    unit?: string;
    brand?: string;
    model?: string;
    unitPrice?: number;
    currency?: string;
    service?: string;
    tech?: Requirement[];
}

interface TenderDetails {
    org?: { name: string };
    publish: {
        id: string;
        subject: string;
        timeBegin?: number;
        standard: boolean;
        contentType: string;
        content?: string;
        attach?: Array<{ id: string; name: string }>;
    };
    enquiry?: {
        budgetOpen?: boolean;
        budgetLimit?: boolean;
        budget?: number;
        budgetCurrency?: string;
        payWay?: string;
        signTimeHope?: string;
        receiveTimeHope?: string;
        receiveAddress?: string;
        quals?: Requirement[];
        busis?: Requirement[];
        items?: PurchaseItem[];
    };
}

function renderRequirements(requirements?: Requirement[]) {
    return (requirements ?? []).map((item) => String(html`<p>${item.name}${item.remark ? html`<br />${item.remark}` : ''}</p>`)).join('');
}

function renderPurchase(details: TenderDetails) {
    const enquiry = details.enquiry;
    if (!enquiry) {
        return details.publish.content || undefined;
    }
    const fields = [
        ['付款方式', enquiry.payWay],
        ['签约时间', enquiry.signTimeHope],
        ['交货时间', enquiry.receiveTimeHope],
        ['交货地址', enquiry.receiveAddress],
    ];
    const conditions = fields.filter(([, value]) => value).map(([label, value]) => String(html`<p><strong>${label}：</strong>${value}</p>`));
    if ((enquiry.budgetOpen || enquiry.budgetLimit) && enquiry.budget !== undefined) {
        conditions.push(String(html`<p><strong>预算总价：</strong>${enquiry.budgetCurrency} ${enquiry.budget}</p>`));
    }
    const items = (enquiry.items ?? []).map((item) => {
        const fields = [
            ['数量', item.applyNums],
            ['单位', item.unit],
            ['品牌', item.brand],
            ['型号', item.model],
            ['服务要求', item.service],
            ['预算单价', item.unitPrice ? `${item.currency || ''} ${item.unitPrice}` : undefined],
        ];
        return (
            String(html`<h3>${item.name}</h3>`) +
            fields
                .filter(([, value]) => (value ?? '') !== '')
                .map(([label, value]) => String(html`<p><strong>${label}：</strong>${value}</p>`))
                .join('') +
            renderRequirements(item.tech)
        );
    });
    const attachments = (details.publish.attach ?? []).map((file) => String(html`<p><a href="${`https://file.yuncaitong.cn/${file.id}`}">${file.name}</a></p>`));
    return [details.publish.content || '', ...conditions, renderRequirements(enquiry.quals), renderRequirements(enquiry.busis), ...items, ...attachments].join('') || undefined;
}

function parseCalendarDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD HH:mm:ss');
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

export async function getTenderFeed(): Promise<Data> {
    const link = 'https://cggl.hitsz.edu.cn/sfw_cms/e?page=cms.psms.gglist&type=XQ';
    const response = await ofetch(link);
    const $ = load(response);
    const token = response.match(/data\.ops_uuid\s*=\s*"([^"]+)"/)?.[1];
    const table = $('table[action="cms.psms.publish.query"]');
    const pageSize = table.attr('limit');
    const types = $('.menu a.active').attr('data-dipid')?.split(',');
    if (!token || !pageSize || !types?.length) {
        throw new Error('The current public procurement first-page settings were not found.');
    }
    const body = new URLSearchParams({
        page: 'cms.psms.publish.query',
        window_: 'json',
        request_method_: 'ajax',
        browser_: 'notmsie',
        start: '1',
        limit: pageSize,
        sort: 'pdate desc',
        ops_uuid: token,
        shopType: '',
        orgType: '',
        keywords: '',
    });
    for (const type of types) {
        body.append('type', type);
    }
    const result = await ofetch<{ resultset: TenderRow[] }>('https://cggl.hitsz.edu.cn/sfw_cms/e', { method: 'POST', body, responseType: 'json' });
    const items = await pMap(
        result.resultset,
        async (row): Promise<DataItem> => {
            const date = (row.syncTime || row.beginTime)?.split(' ', 1)[0].replaceAll('-', '/');
            if (!row.syncId || !date) {
                throw new Error('A public procurement notice is missing its native document identifier or storage date.');
            }
            const base = `https://provider.yuncaitong.cn/publish/${date}/${row.syncId}`;
            const detail = await cache.tryGet(`${base}.sson`, async () => {
                const data = await ofetch<TenderDetails>(`${base}.sson`, { responseType: 'json' });
                const pubDate = Number.isFinite(data.publish.timeBegin) ? parseDate(data.publish.timeBegin!) : undefined;
                if (data.publish.standard) {
                    return { description: renderPurchase(data), pubDate, author: data.org?.name };
                }
                if (data.publish.contentType === 'PDF') {
                    const enclosureUrl = `${base}/content.pdf`;
                    return { description: String(html`<p><a href="${enclosureUrl}">查看公告 PDF</a></p>`), enclosure_url: enclosureUrl, enclosure_type: 'application/pdf', pubDate, author: data.org?.name };
                }
                const description = await ofetch(`${base}/content.html`);
                return { description, pubDate, author: data.org?.name };
            });
            return {
                ...detail,
                title: row.subject,
                link: `https://cggl.hitsz.edu.cn/provider/#/publish/${row.syncId}`,
                guid: row.syncId,
                category: row.shopTypeName,
                pubDate: detail.pubDate ?? parseCalendarDate(row.beginTime),
            };
        },
        { concurrency: 3 }
    );
    return { title: '哈尔滨工业大学（深圳）-招标信息', link, item: items };
}
