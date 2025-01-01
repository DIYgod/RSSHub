import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseTitle = '南信大信息公告栏';
const baseUrl = 'https://bulletin.nuist.edu.cn';
const map = {
    791: '全部',
    792: '文件公告',
    xsbgw: '学术报告',
    779: '招标信息',
    780: '会议通知',
    781: '党政事务',
    782: '组织人事',
    783: '科研信息',
    784: '招生就业',
    785: '教学考试',
    786: '专题讲座',
    788: '校园活动',
    789: '学院动态',
    qt: '其他',
};

export const route: Route = {
    path: '/bulletin/:category?',
    categories: ['university'],
    example: '/nuist/bulletin/791',
    parameters: { category: '默认为 `791`' },
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
            source: ['bulletin.nuist.edu.cn/:category/list.htm'],
            target: '/bulletin/:category',
        },
    ],
    name: '南信大信息公告栏',
    maintainers: ['gylidian'],
    handler,
    description: `| 全部 | 文件公告 | 学术报告 | 招标信息 | 会议通知 | 党政事务 | 组织人事 |
  | ---- | -------- | -------- | -------- | -------- | -------- | -------- |
  | 791  | 792      | xsbgw    | 779      | 780      | 781      | 782      |

  | 科研信息 | 招生就业 | 教学考试 | 专题讲座 | 校园活动 | 学院动态 | 其他 |
  | -------- | -------- | -------- | -------- | -------- | -------- | ---- |
  | 783      | 784      | 785      | 786      | 788      | 789      | qt   |

::: warning
  全文内容需使用 校园网或[VPN](http://vpn.nuist.edu.cn) 获取
:::`,
};

async function handler(ctx) {
    const category = Object.hasOwn(map, ctx.req.param('category')) ? ctx.req.param('category') : '791';
    const link = `${baseUrl}/${category}/list.htm`;

    const response = await got(link);
    const $ = load(response.data);
    const list = $('.news_list').find('.news');

    return {
        title: baseTitle + (category === '791' ? '' : ':' + map[category]),
        link,
        item: list
            .map((_, item) => {
                item = $(item);

                if (category === 'xsbgw') {
                    const itemXsTitle = item.find('.xs_title .btt a');
                    return {
                        title: itemXsTitle.text(),
                        author: item.find('.xs_bgr').text(),
                        category: '学术报告',
                        pubDate: parseDate(item.find('.xs_date').text()),
                        link: new URL(itemXsTitle.attr('href'), baseUrl).href,
                    };
                }

                const itemTitle = item.find('.news_title');
                return {
                    title: [itemTitle.find('.zdtb img').length > 0 ? '[顶]' : '', itemTitle.find('.btt').text()].join(' '),
                    author: item.find('.news_org').text(),
                    category: itemTitle.find('.wjj').text(),
                    pubDate: parseDate(item.find('.news_date').text()),
                    link: new URL(itemTitle.find('.btt a').attr('href'), baseUrl).href,
                };
            })
            .get(),
    };
}
