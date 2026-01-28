import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseTitle = '南信大信息公告栏';
const rootUrl = 'https://bulletin.nuist.edu.cn';
const map = {
    default: { file: 'index.htm', title: '全部' },
    wjgg: { file: 'wjgg.htm', title: '文件公告' },
    zbxx: { file: 'zbxx.htm', title: '招标信息' },
    xsbg: { file: 'xsbg.htm', title: '学术报告' },
    dzsw: { file: 'dzsw.htm', title: '党政事务' },
    jxks: { file: 'jxks.htm', title: '教学考试' },
    hytz: { file: 'hytz.htm', title: '会议通知' },
    zzrs: { file: 'zzrs.htm', title: '组织人事' },
    kyxx: { file: 'kyxx.htm', title: '科研信息' },
    zsjy: { file: 'zsjy.htm', title: '招生就业' },
    cxcy: { file: 'cxcy.htm', title: '创新创业' },
    xyhd: { file: 'xyhd.htm', title: '校园活动' },
    xydt: { file: 'xydt.htm', title: '学院动态' },
    ztjz: { file: 'ztjz.htm', title: '专题讲座' },
};

export const route: Route = {
    path: '/bulletin/:category?',
    categories: ['university'],
    example: '/nuist/bulletin/wjgg',
    parameters: { category: '分类名，默认为 `default` (全部)，支持 wjgg, kyxx 等拼音缩写' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bulletin.nuist.edu.cn/:filename'],
            target: (params) => {
                const filename = params.filename.replace(/\.htm$/i, '');
                return filename === 'index' ? '/bulletin' : `/bulletin/${filename}`;
            },
        },
    ],
    name: '南信大信息公告栏',
    maintainers: ['gylidian', 'QianYu-u'],
    handler,
    description: `
| 参数 | 含义 |
| :--- | :--- |
| default | 全部 |
| wjgg | 文件公告 |
| kyxx | 科研信息 |
| zbxx | 招标信息 |
| jxks | 教学考试 |
| dzsw | 党政事务 |
| ... | (支持官网对应栏目的拼音简写) |

::: warning
  全文内容需使用 校园网或[VPN](http://vpn.nuist.edu.cn) 获取
:::`,
};

async function handler(ctx) {
    const type = ctx.req.param('category') || 'default';
    const info = map[type] || map.default;
    const link = `${rootUrl}/${info.file}`;

    const response = await got(link);
    const $ = load(response.data);

    const list = $('a[href*="content.jsp"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            if (!href) {
                return null;
            }

            const parent = item.closest('li, tr');
            const title = item.attr('title') || item.text().trim();
            const linkUrl = new URL(href, rootUrl).href;

            const allText = parent.text();
            const dateMatch = allText.match(/(\d{4}-\d{2}-\d{2})/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : null;

            return {
                title,
                link: linkUrl,
                pubDate,
                // 使用 map 中的中文标题作为分类
                category: info.title,
            };
        })
        // 过滤掉 null (href不存在的情况) 和无效条目
        .filter((item) => item && item.title && item.pubDate);

    return {
        // 标题现在会显示：南信大信息公告栏 - 科研信息
        title: `${baseTitle} - ${info.title}`,
        link,
        item: list,
    };
}
