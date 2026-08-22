import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cssearch/latest/:webVpn/:key',
    categories: ['university'],
    example: '/hzcu/cssearch/latest/0/白卡',
    parameters: { webVpn: '见下表(默认为0)', key: '关键词(默认为白卡)' },
    name: '计算分院全站搜索',
    maintainers: ['zhang-wangz'],
    handler,
    description: `| 0                  | 1                    |
| ------------------ | -------------------- |
| 文章地址为正常地址 | 获取的是 webvpn 地址 |`,
};

const baseUrl = 'http://jsxy.hzcu.edu.cn/';
const vpnUrl = 'http://jsxy.webvpn.hzcu.edu.cn/';
const searchPath = 'module/sitesearch/index.jsp?keyword=vc_title&columnid=0&webid=2&modalunitid=13014';

async function handler(ctx: Context) {
    const { webVpn, key } = ctx.req.param();
    const keyVal = key || encodeURIComponent('白卡');
    const pageNum = 1;
    const vpnBool = Number.parseInt(webVpn) || 0;

    const response = await ofetch(baseUrl + searchPath.concat('&keyvalue=', encodeURIComponent(keyVal), '&currpage=', pageNum.toString()));
    const $ = load(response);

    const resItem = $('a')
        .toArray()
        .filter((el) => $(el).attr('target') === '_blank')
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href')!;
            const dateList = href.match(/\/\d+/g)!.map((ele) => ele.replace('/', ''));
            const title = $el.text();

            return {
                title,
                link: vpnBool === 0 ? href : vpnUrl + href.slice(24),
                pubDate: parseDate(dateList.join('-')),
                description: '<br/>' + $el.attr('title') + '<br/>部分全文内容需使用校园网或VPN获取',
                guid: title,
            };
        });

    return {
        title: '浙大城市学院计算分院全站搜索:' + keyVal,
        link: vpnBool === 0 ? baseUrl : vpnUrl,
        item: resItem,
    };
}
