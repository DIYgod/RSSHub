import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface RecruitmentItem extends DataItem {
    link: string;
    ID?: number;
}

interface Company {
    CompanyID: number;
    CompanyName: string;
    nPos?: string;
    Stand?: string;
    JobList?: string;
}

function renderCompanyList(response: { CompanyList?: Company[]; data?: string }, rootUrl: string): string | undefined {
    const $ = load('<table><thead><tr><th>单位名称</th><th>展位号</th><th>职位信息</th></tr></thead><tbody></tbody></table>');
    if (!response.CompanyList?.length) {
        return typeof response.data === 'string' ? ($('<p>').text(response.data).prop('outerHTML') ?? undefined) : undefined;
    }
    const body = $('tbody');
    for (const company of response.CompanyList) {
        const row = $('<tr>');
        row.append($('<td>').append($('<a>').attr('href', `${rootUrl}/Jobinformation/info.aspx?itemid=${company.CompanyID}`).text(company.CompanyName)));
        row.append($('<td>').text(company.nPos ?? company.Stand ?? ''));
        row.append($('<td>').html(company.JobList ?? ''));
        body.append(row);
    }
    return $('table').prop('outerHTML') ?? undefined;
}

const rand = 0.01234567890123456;
const apiRootUrl = 'https://ustc.ahbys.com';
const rootUrl = 'https://job.ustc.edu.cn';

function parseRecruitmentDate(value?: string): Date | undefined {
    if (!value) {
        return undefined;
    }
    const parsed = parseDate(value);
    return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? parsed : timezone(parsed, 8);
}

async function getRecruitmentDetails(category: string, id?: number): Promise<Pick<DataItem, 'title' | 'description'>> {
    const eventResponse = category === 'Doublechoice' ? await got({ method: 'post', url: `${rootUrl}/Ajax/jywapi.ashx`, form: { action: 'recruitinfo', rid: id } }) : undefined;
    const detailResponse = await got({
        method: (() => {
            switch (category) {
                case 'RecruitList':
                case 'Broadcast':
                    return 'get';
                case 'joblist2':
                case 'Doublechoice':
                    return 'post';
                default:
                    throw new Error(`Unknown category: ${category}`);
            }
        })(),

        url: (() => {
            switch (category) {
                case 'RecruitList':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&action=bookinginfo&rid=${id}&rand=${rand}`;
                case 'Doublechoice':
                    return `${rootUrl}/Ajax/jywapi.ashx`;
                case 'Broadcast':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&action=binfo&rid=${id}&rand=${rand}`;
                case 'joblist2':
                    return `${rootUrl}/Ajax/jywapi.ashx`;
                default:
                    throw new Error(`Unknown category: ${category}`);
            }
        })(),

        form: category === 'Doublechoice' ? { action: 'recruitcompany', rid: id, pageindex: 1, pagesize: 100 } : category === 'joblist2' ? { action: 'jobinfo2', jid: id } : undefined,
    });

    const title = (() => {
        switch (category) {
            case 'RecruitList':
            case 'Broadcast':
                return detailResponse.data.Theme;
            case 'Doublechoice':
                return;
            case 'joblist2':
                return detailResponse.data.JobName;
            default:
                throw new Error(`Unknown category: ${category}`);
        }
    })();

    const description = (() => {
        switch (category) {
            case 'RecruitList':
            case 'Broadcast':
                return detailResponse.data.Description;

            case 'Doublechoice': {
                const content = [eventResponse?.data.Description, renderCompanyList(detailResponse.data, rootUrl)].filter(Boolean).join('');
                return content || undefined;
            }

            case 'joblist2':
                return detailResponse.data.PostionDesc;
            default:
                throw new Error(`Unknown category: ${category}`);
        }
    })();

    return { title, description };
}

const titles = {
    RecruitList: '专场招聘会',
    Doublechoice: '校园双选会',
    Broadcast: '空中宣讲',
    joblist2: '招聘公告',
};

export const route: Route = {
    path: '/job/:category?',
    categories: ['university'],
    example: '/ustc/job',
    parameters: { category: '分类，见下表，默认为招聘公告' },
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
            source: ['job.ustc.edu.cn/'],
            target: '/job',
        },
    ],
    name: '就业信息网',
    maintainers: ['nczitzk'],
    handler,
    url: 'job.ustc.edu.cn/',
    description: `| 专场招聘会  | 校园双选会   | 空中宣讲  | 招聘公告 |
| ----------- | ------------ | --------- | -------- |
| RecruitList | Doublechoice | Broadcast | joblist2 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'joblist2';

    const pages = { RecruitList: 'Specialrecruitment', Doublechoice: 'Campusdouble', Broadcast: 'airtalk', joblist2: 'Recruitment' };
    const currentUrl = `${rootUrl}/${pages[category]}/list.aspx`;

    const response = await got({
        method: (() => {
            switch (category) {
                case 'RecruitList':
                case 'Broadcast':
                    return 'get';
                case 'joblist2':
                case 'Doublechoice':
                    return 'post';
                default:
                    throw new Error(`Unknown category: ${category}`);
            }
        })(),

        url: (() => {
            switch (category) {
                case 'RecruitList':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&pagesize=20&pageindex=1&action=bookinglist&kind=13&keyword=`;
                case 'Doublechoice':
                    return `${rootUrl}/Ajax/jywapi.ashx`;
                case 'Broadcast':
                    return `${apiRootUrl}/API/Web/index10358.ashx?rd=${rand}&pagesize=20&pageindex=1&action=bookinglist2&kind=2`;
                case 'joblist2':
                    return `${rootUrl}/Ajax/jywapi.ashx`;
                default:
                    throw new Error(`Unknown category: ${category}`);
            }
        })(),

        form: category === 'Doublechoice' ? { action: 'recruitlist', pageindex: 1, pagesize: 10 } : category === 'joblist2' ? { action: 'joblist2', pageindex: 1, pagesize: 10 } : undefined,
    });

    const list: RecruitmentItem[] = response.data.data.slice(0, 10).map((item) => {
        switch (category) {
            case 'RecruitList':
                return {
                    ID: item.ID,
                    title: item.Theme,
                    pubDate: parseRecruitmentDate(item.HoldDate),
                    link: `${rootUrl}/Specialrecruitment/info.aspx?itemid=${item.ID}`,
                };
            case 'Doublechoice':
                return {
                    ID: item.ID,
                    title: item.Theme,
                    pubDate: parseRecruitmentDate(item.HoldDate),
                    link: `${rootUrl}/Campusdouble/info.aspx?itemid=${item.ID}`,
                };
            case 'Broadcast':
                return {
                    ID: item.ID,
                    title: item.Theme,
                    pubDate: parseRecruitmentDate(item.HoldDate),
                    link: `${rootUrl}/airtalk/info.aspx?itemid=${item.ID}`,
                };
            case 'joblist2':
                return {
                    ID: item.JID,
                    title: item.JobName,
                    updated: parseRecruitmentDate(item.UpdateDate),
                    link: `${rootUrl}/Recruitment/info.aspx?itemid=${item.JID}`,
                };
            default:
                return {};
        }
    });

    const items = await pMap(
        list,
        async ({ ID, ...item }) => {
            const details = await cache.tryGet<Pick<DataItem, 'title' | 'description'>>(`ustc:job:detail:${item.link}`, () => getRecruitmentDetails(category, ID));
            return { ...item, ...details, title: item.title ?? details.title };
        },
        { concurrency: 3 }
    );

    return {
        title: `${titles[category]} - 中国科学技术大学就业信息网`,
        link: currentUrl,
        item: items,
    };
}
