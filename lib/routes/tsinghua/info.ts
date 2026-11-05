import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://info.tsinghua.edu.cn/';
const newsUrl = 'https://postinfo.tsinghua.edu.cn/f/';

const map = new Map([
    ['zhongyao', { title: '重要公告', path: 'zhongyaogonggao/more', layout: 'table' }],
    ['keyan', { title: '科研通知', path: 'keyantongzhi/more', layout: 'list' }],
    ['bangong', { title: '办公通知', path: 'bangongtongzhi/more', layout: 'list' }],
    ['jiaowu', { title: '教务公告', path: 'jiaowugonggao/more', layout: 'list' }],
    ['haibao', { title: '海报列表', path: 'haibao/more', layout: 'list' }],
    ['yiqing', { title: '疫情防控', path: 'yiqingfangkong/more', layout: 'table' }],
]);

export const route: Route = {
    path: '/info/:type',
    categories: ['university'],
    example: '/tsinghua/info/zhongyao',
    parameters: { type: '分类，必填，见下表，例如 `zhongyao`（重要公告）' },
    name: '校内信息发布平台',
    maintainers: ['prnake'],
    handler,
    description: `| 重要公告 | 教务公告 | 科研通知 | 办公通知 | 海报列表 | 疫情防控 |
| -------- | -------- | -------- | -------- | -------- | :------: |
| zhongyao | jiaowu   | keyan    | bangong  | haibao   |  yiqing  |

::: warning
由于学校通知仅允许校园网访问，需自行部署。
:::`,
};

function getLink(href: string | undefined) {
    return href?.trim() ? new URL(href, newsUrl).href : undefined;
}

function parseReportedDate(value: string): Date | undefined {
    const parts = value.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2}))?)?/);
    if (!parts) {
        return undefined;
    }
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = parts;
    const date = parseDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`, 'YYYY-MM-DD HH:mm:ss', true);

    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const { title, path, layout } = map.get(type) ?? map.get('zhongyao')!;

    const link = newsUrl + path;
    const response = await ofetch(link, {
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response);

    const items =
        layout === 'table'
            ? $('table>tbody>tr')
                  .slice(0, 10)
                  .toArray()
                  .map((elem) => ({
                      link: getLink($('td>a', elem).attr('href')),
                      title: $('td>a', elem).text() || $('td', elem).text(),
                      pubDate: parseReportedDate($('td>font>span', elem).text()),
                  }))
            : $('.cont_list>li')
                  .slice(0, 10)
                  .toArray()
                  .map((elem) => ({
                      link: getLink($('a', elem).attr('href')),
                      title: $('a', elem).text(),
                      pubDate: parseReportedDate($('time', elem).text()),
                  }));

    return {
        title: `清华大学 - ${title}`,
        link,
        description: `清华大学内网信息发布平台 - ${title}`,
        item: items.filter((item) => item.link),
    };
}
