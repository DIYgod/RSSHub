import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

const baseUrl = 'https://www.cde.org.cn';
const xxgkMap = {
    xxgk: {
        priorityApproval: {
            title: '优先审评公示',
            url: `${baseUrl}/main/xxgk/listpage/2f78f372d351c6851af7431c7710a731`,
            endPoint: '/priority/getPriorityApprovalList',
            form: {
                pageSize: 50,
                pageNum: 1,
                noticeType: 2,
                acceptid: '',
                drugname: '',
                company: '',
            },
        },
        breakthroughCure: {
            title: '突破性治疗公示',
            url: `${baseUrl}/main/xxgk/listpage/da6efd086c099b7fc949121166f0130c`,
            endPoint: '/breakthrough/getBreakthroughCureList',
            form: {
                pageSize: 50,
                pageNum: 1,
                noticeType: 1,
                acceptid: '',
                drugname: '',
                company: '',
            },
        },
        cliniCal: {
            title: '临床试验默示许可',
            url: `${baseUrl}/main/xxgk/listpage/4b5255eb0a84820cef4ca3e8b6bbe20c`,
            endPoint: '/xxgk/getCliniCalList',
            form: {
                pageSize: 50,
                pageNum: 1,
                condition: '',
            },
        },
    },
};

export const route: Route = {
    path: '/xxgk/:category',
    categories: ['government'],
    example: '/cde/xxgk/priorityApproval',
    parameters: { category: '类别，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '信息公开',
    maintainers: ['TonyRL'],
    handler,
    description: `|   优先审评公示   |  突破性治疗公示  | 临床试验默示许可 |
| :--------------: | :--------------: | :--------------: |
| priorityApproval | breakthroughCure |     cliniCal     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    const { data } = await got.post(`${baseUrl}/main${xxgkMap.xxgk[category].endPoint}`, {
        form: xxgkMap.xxgk[category].form,
        headers: {
            referer: xxgkMap.xxgk[category].url,
            cookie: await utils.getCookie(ctx),
        },
    });

    const items = data.data.records.map((item) => {
        let description: string;
        switch (category) {
            case 'priorityApproval':
                description = renderToString(<PriorityApprovalTable item={item} />);
                break;
            case 'breakthroughCure':
                description = renderToString(<BreakthroughCureTable item={item} />);
                break;
            case 'cliniCal':
                description = renderToString(<CliniCalTable item={item} />);
                break;
            default:
                description = '';
        }

        return {
            title: item.drgnamecn,
            guid: item.acceptid,
            pubDate: item.endNoticeDate ? parseDate(item.endNoticeDate) : null,
            description,
            link: xxgkMap.xxgk[category].url,
        };
    });

    return {
        title: `${xxgkMap.xxgk[category].title} - 国家药品监督管理局药品审评中心`,
        link: xxgkMap.xxgk[category].url,
        item: items,
    };
}

const PriorityApprovalTable = ({ item }: { item: any }) => (
    <table>
        <tr>
            <th>受理号</th>
            <th>药品名称</th>
            <th>注册申请人</th>
            <th>承办日期</th>
            <th>申请日期</th>
            <th>公示日期</th>
        </tr>
        <tr>
            <td>{item.acceptid}</td>
            <td>{item.drgnamecn}</td>
            <td>{item.company}</td>
            <td>{item.createdate}</td>
            <td>{item.applyDate}</td>
            <td>{item.noticeDate}</td>
        </tr>
    </table>
);

const BreakthroughCureTable = ({ item }: { item: any }) => (
    <table>
        <tr>
            <th>受理号</th>
            <th>药品名称</th>
            <th>注册申请人</th>
            <th>申请日期</th>
            <th>公示日期</th>
            <th>公示截止日期</th>
        </tr>
        <tr>
            <td>{item.acceptid}</td>
            <td>{item.drgnamecn}</td>
            <td>{item.company}</td>
            <td>{item.applyDate}</td>
            <td>{item.noticeDate}</td>
            <td>{item.endNoticeDate}</td>
        </tr>
    </table>
);

const CliniCalTable = ({ item }: { item: any }) => (
    <table>
        <tr>
            <th>受理号</th>
            <th>药品名称</th>
            <th>申请人名称</th>
            <th>适应症</th>
            <th>注册分类</th>
        </tr>
        <tr>
            <td>{item.acceptid}</td>
            <td>{item.drgnamecn}</td>
            <td>{item.companys}</td>
            <td>{item.lcmsxkIndication}</td>
            <td>{item.lcmsxkRegisterkind}</td>
        </tr>
    </table>
);
