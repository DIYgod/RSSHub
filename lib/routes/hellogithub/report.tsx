import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

type ReportListItem = {
    position: string | number;
    name: string;
    rating: string | number;
    change?: string | number;
    star?: string | number;
    total?: string | number;
    db_model?: string;
};

const renderReport = ({ tiobeList, activeList, allList, dbList }: { tiobeList?: ReportListItem[]; activeList?: ReportListItem[]; allList?: ReportListItem[]; dbList?: ReportListItem[] }) =>
    renderToString(
        <>
            {tiobeList?.length ? (
                <table>
                    <tbody>
                        <tr>
                            <th>排名</th>
                            <th>编程语言</th>
                            <th>流行度</th>
                            <th>对比上月</th>
                            <th>年度明星语言</th>
                        </tr>
                        {tiobeList.map((item) => (
                            <tr>
                                <td>{item.position}</td>
                                <td>{item.name}</td>
                                <td>{item.rating}</td>
                                <td>{item.change || '新上榜'}</td>
                                <td>{item.star}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : null}
            {allList?.length ? (
                <>
                    <h1>市场份额排名</h1>
                    <table>
                        <tbody>
                            <tr>
                                <th>排名</th>
                                <th>服务器</th>
                                <th>占比</th>
                                <th>对比上月</th>
                                <th>总数</th>
                            </tr>
                            {allList.map((item) => (
                                <tr>
                                    <td>{item.position}</td>
                                    <td>{item.name}</td>
                                    <td>{item.rating}</td>
                                    <td>{item.change || '新上榜'}</td>
                                    <td>{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <br />
                </>
            ) : null}
            {activeList?.length ? (
                <>
                    <h1>活跃网站排名</h1>
                    <table>
                        <tbody>
                            <tr>
                                <th>排名</th>
                                <th>服务器</th>
                                <th>占比</th>
                                <th>对比上月</th>
                                <th>总数</th>
                            </tr>
                            {activeList.map((item) => (
                                <tr>
                                    <td>{item.position}</td>
                                    <td>{item.name}</td>
                                    <td>{item.rating}</td>
                                    <td>{item.change || '新上榜'}</td>
                                    <td>{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : null}
            {dbList?.length ? (
                <table>
                    <tbody>
                        <tr>
                            <th>排名</th>
                            <th>数据库</th>
                            <th>分数</th>
                            <th>对比上月</th>
                            <th>类型</th>
                        </tr>
                        {dbList.map((item) => (
                            <tr>
                                <td>{item.position}</td>
                                <td>{item.name}</td>
                                <td>{item.rating}</td>
                                <td>{item.change || '新上榜'}</td>
                                <td>{item.db_model}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : null}
        </>
    );

const types = {
    tiobe: '编程语言',
    netcraft: '服务器',
    'db-engines': '数据库',
};

export const route: Route = {
    path: '/ranking/:type?',
    example: '/hellogithub/ranking',
    name: '榜单报告',
    maintainers: ['moke8', 'nczitzk'],
    handler,
    description: `| 编程语言 | 服务器   | 数据库     |
| -------- | -------- | ---------- |
| tiobe    | netcraft | db-engines |`,
};

async function handler(ctx) {
    let type = ctx.req.param('type') ?? 'tiobe';

    type = type === 'webserver' ? 'netcraft' : type === 'db' ? 'db-engines' : type;

    const rootUrl = 'https://hellogithub.com';
    const currentUrl = `${rootUrl}/report/${type}`;

    const buildResponse = await got({
        method: 'get',
        url: rootUrl,
    });

    const buildId = buildResponse.data.match(/"buildId":"(.*?)",/)[1];

    const apiUrl = `${rootUrl}/_next/data/${buildId}/zh/report/${type}.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data.pageProps;

    const items = [
        {
            guid: `${type}:${data.year}${data.month}`,
            title: `${data.year}年${data.month}月${types[type]}排行榜`,
            link: currentUrl,
            pubDate: parseDate(`${data.year}-${data.month}`, 'YYYY-M'),
            description: renderReport({
                tiobeList: type === 'tiobe' ? data.list : undefined,
                activeList: data.active_list,
                allList: data.all_list,
                dbList: type === 'db-engines' ? data.list : undefined,
            }),
        },
    ];

    return {
        title: `HelloGitHub - ${types[type]}排行榜`,
        link: currentUrl,
        item: items,
    };
}
