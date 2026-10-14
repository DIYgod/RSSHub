import { html } from 'hono/html';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/auditstatus/:apply_id',
    categories: ['government'],
    example: '/gov/csrc/auditstatus/9ce91cf2d750ee62de27fbbcb05fa483',
    parameters: { apply_id: '事项类别id，`https://neris.csrc.gov.cn/alappl/home/xkDetail` 列表中各地址的 appMatrCde 参数' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '申请事项进度',
    maintainers: ['hillerliao'],
    handler,
};

interface Progress {
    taskName?: string;
    fnshDate?: number;
    fileTypeCde?: string;
    alFileCde?: string;
    offsetInfmPubIndc?: string;
}

interface Application {
    alAppLtCde: string;
    appMatrName: string;
    apptPubName: string;
    alDecsBookFileno?: string;
    acptInfmPubIndc?: string;
    wrtnFdbkInfmPubIndc?: string;
    alDecsBookPubIndc?: string;
    abtdRenewInfmPubIndc?: string;
    cnlInfmPubIndc?: string;
    aprvSchdPubFlowPOs?: Progress[];
}

const baseUrl = 'https://neris.csrc.gov.cn';
const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });

function getDate(timestamp?: number) {
    if (timestamp === undefined || timestamp === null) {
        return;
    }
    const date = parseDate(timestamp);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function getPublicProgress(application: Application) {
    return (application.aprvSchdPubFlowPOs ?? []).filter((progress) => {
        const taskName = progress.taskName;
        if (!taskName) {
            return false;
        }
        if (application.alDecsBookFileno === '0500' || !progress.fileTypeCde) {
            return true;
        }
        switch (progress.fileTypeCde) {
            case '02':
                return taskName === '补正通知' || taskName === '接收补正材料';
            case '04':
                return taskName.includes('书面反馈') || taskName.includes('接收书面回复');
            default:
                return ['03', '05', '06', '07', '08'].includes(progress.fileTypeCde);
        }
    });
}

function getPublicFileUrl(application: Application, progress: Progress) {
    if ((progress.fileTypeCde === '02' && progress.taskName !== '补正通知') || (progress.fileTypeCde === '04' && !progress.taskName?.includes('书面反馈'))) {
        return;
    }
    const permission = {
        '02': progress.offsetInfmPubIndc,
        '03': application.acptInfmPubIndc,
        '04': application.wrtnFdbkInfmPubIndc,
        '05': application.alDecsBookPubIndc,
        '06': application.abtdRenewInfmPubIndc,
        '07': application.abtdRenewInfmPubIndc,
        '08': application.cnlInfmPubIndc,
    }[progress.fileTypeCde ?? ''];
    if (application.alDecsBookFileno === '0500' || permission !== '1' || !progress.alFileCde) {
        return;
    }
    const url = new URL('/alappl/home/buZhengList', baseUrl);
    url.searchParams.set('alFileCde', progress.alFileCde);
    return url.href;
}

function renderProgress(application: Application, step: Progress) {
    const date = getDate(step.fnshDate);
    const fileUrl = getPublicFileUrl(application, step);
    return html`<li>${date ? dateFormatter.format(date) : ''} ${fileUrl ? html`<a href="${fileUrl}">${step.taskName}</a>` : step.taskName}</li>`;
}

async function handler(ctx) {
    const { apply_id: applyId } = ctx.req.param();
    const data = await ofetch<{ appltList: Application[] }>(`${baseUrl}/alappl/home1/newOnlinealog`, {
        query: { appMatrCde: applyId, appMatrName: '', apptName: '', pageNo: 1, pageSize: 10 },
    });
    if (!Array.isArray(data.appltList)) {
        throw new TypeError('CSRC approval API returned an unexpected application list.');
    }
    const pageUrl = new URL('/alappl/home1/onlinealog', baseUrl);
    pageUrl.searchParams.set('appMatrCde', applyId);

    return {
        title: `${data.appltList[0]?.appMatrName ?? '中国证监会'} - 申请事项进度查询 - 中国证监会`,
        link: pageUrl.href,
        language: 'zh-CN' as const,
        item: data.appltList.map((application) => {
            if (!application.alAppLtCde) {
                throw new Error('CSRC approval API returned an application without its public identifier.');
            }
            const progress = getPublicProgress(application);
            const latest = progress.at(-1);
            const progressHtml = progress.map((step) => renderProgress(application, step));
            return {
                title: `${latest?.taskName ? `【${latest.taskName}】` : ''}关于${application.apptPubName}的《${application.appMatrName}》`,
                guid: application.alAppLtCde,
                pubDate: getDate(latest?.fnshDate),
                description: `<ul>${progressHtml.join('')}</ul>`,
            };
        }),
    };
}
