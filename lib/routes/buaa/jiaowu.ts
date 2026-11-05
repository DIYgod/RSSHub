import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://jiaowu.buaa.edu.cn/';
const menus = new Map([
    ['02', { title: '通知公告', path: '', selector: '.part1BR > ul > li' }],
    ['03', { title: '新闻快讯', path: 'xwkx.htm', selector: '.n_bt > ul > li' }],
    ['0203', { title: '公示专区', path: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1545', selector: '.n_bt > ul > li' }],
]);

export const route: Route = {
    path: '/jiaowu/:cddm?',
    name: '教务部',
    url: 'jiaowu.buaa.edu.cn',
    maintainers: ['OverflowCat'],
    handler,
    example: '/buaa/jiaowu/02',
    parameters: {
        cddm: '栏目代码：02（通知公告，默认）、03（新闻快讯）、0203（公示专区）',
    },
    description: '通知公告取官网首页的通知列表，包含学生和教师通知。旧站 newsList 接口已下线；目前公示专区页面返回系统提示，需等待官网恢复该栏目。',
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const cddm = ctx.req.param('cddm') || '02';
    const menu = menus.get(cddm);
    if (!menu) {
        throw new InvalidParameterError('cddm must be 02 (notices), 03 (news), or 0203 (publicity). The previous menu API is no longer available.');
    }
    const currentUrl = new URL(menu.path, baseUrl).href;
    const { data: body } = await got(currentUrl);
    const $ = load(body);
    const list = $(menu.selector)
        .toArray()
        .map((element) => {
            const $item = $(element);
            const $link = $item.find('a');
            const href = $link.attr('href');
            if (!href) {
                return;
            }
            const date = cddm === '02' ? `${$item.find('.year').text()}-${$item.find('.day').text()}` : $item.find('i').text().replaceAll('.', '-');
            return {
                title: $link.find('p, h5').text(),
                link: new URL(href, currentUrl).href,
                pubDate: timezone(parseDate(date, 'YYYY-MM-DD'), 8),
            };
        })
        .filter((item) => item !== undefined);
    if (!list.length) {
        throw new NotFoundError(`The official ${menu.title} page currently provides no articles. Please check ${currentUrl}.`);
    }
    const orderedList = list;
    const entries = orderedList;
    const item = await Promise.all(
        entries.map((entry) =>
            cache.tryGet(entry.link, async () => {
                const { data: detail } = await got(entry.link);
                const $detail = load(detail);
                return {
                    ...entry,
                    description: $detail('.v_news_content').html(),
                    author: $detail('.n_show i:contains("发布者：")').text().replace('发布者：', '') || '教务部',
                };
            })
        )
    );
    return {
        title: `北京航空航天大学教务部 - ${menu.title}`,
        item,
        link: currentUrl,
        author: '北航教务部',
        language: 'zh-CN',
    };
}
