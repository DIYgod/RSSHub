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
    parameters: { type: '默认为重要公告' },
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

function getLink(href: string | undefined, alterUrl: string) {
    return href === undefined ? alterUrl : new URL(href, newsUrl).href;
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
                      link: getLink($('td>a', elem).attr('href'), link),
                      title: $('td>a', elem).text() || $('td', elem).text(),
                      pubDate: timezone(
                          parseDate(
                              $('td>font>span', elem)
                                  .text()
                                  .replace(/(\d+)\D(\d+)\D(\d+)\D(\d+)/, '2020-$1-$2T$3:$4')
                          ),
                          8
                      ),
                  }))
            : $('.cont_list>li')
                  .slice(0, 10)
                  .toArray()
                  .map((elem) => ({
                      link: getLink($('a', elem).attr('href'), link),
                      title: $('a', elem).text(),
                      pubDate: timezone(
                          parseDate(
                              $('time', elem)
                                  .text()
                                  .replace(/(\d+)\D(\d+)\D(\d+)/, '$1-$2-$3')
                          ),
                          8
                      ),
                  }));

    return {
        title: `清华大学 - ${title}`,
        link,
        description: `清华大学内网信息发布平台 - ${title}`,
        item: items,
    };
}
