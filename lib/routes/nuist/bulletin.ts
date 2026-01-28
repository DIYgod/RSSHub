import { load } from 'cheerio';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseTitle = '南信大信息公告栏';
const rootUrl = 'https://bulletin.nuist.edu.cn';

// 建立新版官网的文件名映射表
const map = {
    'default': 'index.htm',      // 首页/全部
    'wjgg': 'wjgg.htm',          // 文件公告
    'zbxx': 'zbxx.htm',          // 招标信息
    'xsbg': 'xsbg.htm',          // 学术报告
    'dzsw': 'dzsw.htm',          // 党政事务
    'jxks': 'jxks.htm',          // 教学考试
    'hytz2': 'hytz2.htm',          // 会议通知
    'zzrs': 'zzrs.htm',          // 组织人事
    'kyxx': 'kyxx.htm',          // 科研信息
    'zsjy': 'zsjy.htm',          // 招生就业
    'cxcy': 'cxcy.htm',          // 创新创业
    'xyhd': 'xyhd.htm',          // 校园活动
    'xydt': 'xydt.htm',          // 学院动态
    'ztjz': 'ztjz.htm',          // 专题讲座
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
                const filename = params.filename.replace('.htm', '');
                return `/bulletin/${filename === 'index' ? '' : filename}`;
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
    const category = ctx.req.param('category') || 'default';
    const filename = map[category] || 'index.htm';
    const link = `${rootUrl}/${filename}`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('a[href*="content.jsp"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const parent = item.closest('li, tr');
            const title = item.attr('title') || item.text().trim();
            const href = item.attr('href');
            const linkUrl = new URL(href, rootUrl).href;
            const allText = parent.text(); 
            const dateMatch = allText.match(/(\d{4}-\d{2}-\d{2})/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : null;
            
            return {
                title,
                link: linkUrl,
                pubDate,
                category: map[category] ? category : '全部',
            };
        })
        .filter((item) => item.title && item.pubDate);

    return {
        title: `${baseTitle} - ${category === 'default' ? '全部' : category}`,
        link,
        item: list,
    };
}
