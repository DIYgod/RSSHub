import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zw/projectList',
    categories: ['other'],
    example: '/cdzjryb/zw/projectList',
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
            source: ['zw.cdzjryb.com/lottery/accept/projectList', 'zw.cdzjryb.com/'],
        },
    ],
    name: '商品住房购房登记',
    maintainers: ['TonyRL'],
    handler,
    url: 'zw.cdzjryb.com/lottery/accept/projectList',
};

async function handler() {
    const url = 'https://zw.cdzjryb.com/lottery/accept/projectList';
    const { data: response } = await got(url);
    const $ = load(response);

    const list = $('#_projectInfo tr')
        .toArray()
        .map((item) =>
            $(item)
                .find('td')
                .toArray()
                .map((td) => $(td).text().trim())
        );

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(`cdzjryb:zw:projectList${item[0]}`, async () => {
                const { data: notice } = await got.post('https://zw.cdzjryb.com/lottery/accept/getProjectRule', {
                    form: {
                        projectUuid: item[0],
                    },
                });
                return {
                    title: item[3],
                    description: renderToString(<ProjectListDescription item={item} notice={notice.message} />),
                    link: url,
                    guid: `cdzjryb:zw:projectList:${item[0]}`,
                    pubDate: timezone(parseDate(item[8]), 8),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        item: items,
    };
}

const ProjectListDescription = ({ item, notice }: { item: string[]; notice: string }) => {
    const details = item.slice(2, -1);

    return (
        <>
            <table>
                <tr>
                    <th>区域</th>
                    <th>项目名称</th>
                    <th>预售证号</th>
                    <th>预售范围</th>
                    <th>住房套数</th>
                    <th>开发商咨询电话</th>
                    <th>登记开始时间</th>
                    <th>登记结束时间</th>
                    <th>名单外人员资格已释放时间</th>
                    <th>名单内人员资格已释放时间</th>
                    <th>预审码取得截止时间</th>
                    <th>项目报名状态</th>
                </tr>
                <tr>
                    {details.map((value) => (
                        <td>{value}</td>
                    ))}
                </tr>
            </table>
            <h2 style="text-align: center;">登记规则</h2>
            {raw(notice)}
        </>
    );
};
