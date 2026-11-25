import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://gr.xidian.edu.cn';
const struct = {
    home_zxdt: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '主页-最新动态',
        path: '/zxdt',
    },
    home_tzgg1: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '主页-通知公告',
        path: '/tzgg1',
    },
    home_jzbg: {
        selector: {
            list: '.jzbg-list ul li',
        },
        name: '主页-讲座报告',
        path: '/jzbg',
    },
    yyjs_jbqk: {
        name: '研院介绍-基本情况',
        path: '/yyjs/jbqk',
    },
    yyjs_jbqk1: {
        name: '研院介绍-机构设置',
        path: '/yyjs/jbqk1',
    },
    yyjs_jbqk2: {
        name: '研院介绍-部门领导',
        path: '/yyjs/jbqk2',
    },
    yyjs_jbqk3: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '研院介绍-服务指南',
        path: '/yyjs/jbqk3',
    },
    yyjs_jbqk4: {
        name: '研院介绍-学院联系方式',
        path: '/yyjs/jbqk4',
    },
    yjsy: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '招生信息',
        path: '/yjsy',
    },
    yjsy_yjszs: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '招生信息-硕士研究生招生',
        path: '/yjsy/yjszs',
    },
    yjsy_bsyjszs: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '招生信息-博士研究生招生',
        path: '/yjsy/bsyjszs',
    },
    yjsy_qtlxzs: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '招生信息-其他类型招生',
        path: '/yjsy/qtlxzs',
    },
    pygl: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理',
        path: '/pygl',
    },
    pygl_xsxw: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-学术学位',
        path: 'pygl/pyfa1/xsxw1',
    },
    pygl_zyxw: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-专业学位',
        path: '/pygl/pyfa1/zyxw1',
    },
    pygl_jxgl: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-教学管理',
        path: '/pygl/jxgl',
    },
    pygl_jxgl1: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-课程建设',
        path: '/pygl/jxgl1',
    },
    pygl_jxgl2: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-管理规定',
        path: '/pygl/jxgl2',
    },
    pygl_jxgl3: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-国际交流',
        path: '/pygl/jxgl3',
    },
    pygl_bslc: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '培养管理-办事流程',
        path: '/pygl/bslc',
    },
    xwsy: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '学位授予',
        path: '/xwsy',
    },
    xwsy_tzgg: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '学位授予-通知公告',
        path: '/xwsy/tzgg',
    },
    xwsy_gzzd: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '学位授予-规章制度',
        path: '/xwsy/gzzd',
    },
    xwsy_swmd: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '学位授予-授位名单',
        path: '/xwsy/swmd',
    },
    xwsy_zlxz: {
        selector: {
            list: '.main-right-list ul li',
        },
        name: '学位授予-资料下载',
        path: '/xwsy/zlxz',
    },
};
export const route: Route = {
    path: '/gr/:category?',
    categories: ['university'],
    example: '/xidian/gr/home_tzgg1',
    parameters: { category: '通知类别，默认为主页-通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院/卓越工程师学院',
    url: 'gr.xidian.edu.cn',
    maintainers: ['ZiHao256'],
    handler,
    description: `| 文章来源                    | 参数         |
| --------------------------- | ------------ |
| ✅主页 - 最新动态           | home_zxdt    |
| ✅主页 - 通知公告           | home_tzgg1   |
| ✅主页 - 讲座报告           | home_jzbg    |
| ✅研院介绍 - 基本情况       | yyjs_jbqk    |
| ✅研院介绍 - 机构设置       | yyjs_jbqk1   |
| ✅研院介绍 - 部门领导       | yyjs_jbqk2   |
| ✅研院介绍 - 服务指南       | yyjs_jbqk3   |
| ✅研院介绍 - 学院联系方式   | yyjs_jbqk4   |
| ✅招生信息                  | yjsy         |
| ✅招生信息 - 硕士研究生招生 | yjsy_yjszs   |
| ✅招生信息 - 博士研究生招生 | yjsy_bsyjszs |
| ✅招生信息 - 其他类型招生   | yjsy_qtlxzs  |
| ✅培养管理                  | pygl         |
| ✅培养管理 - 学术学位       | pygl_xsxw    |
| ✅培养管理 - 专业学位       | pygl_zyxw    |
| ✅培养管理 - 教学管理       | pygl_jxgl    |
| ✅培养管理 - 课程建设       | pygl_jxgl1   |
| ✅培养管理 - 管理规定       | pygl_jxgl2   |
| ✅培养管理 - 国际交流       | pygl_jxgl3   |
| ✅培养管理 - 办事流程       | pygl_bslc    |
| ✅学位授予                  | xwsy         |
| ✅学位授予 - 通知公告       | xwsy_tzgg    |
| ✅学位授予 - 规章制度       | xwsy_gzzd    |
| ✅学位授予 - 授位名单       | xwsy_swmd    |
| ✅学位授予 - 资料下载       | xwsy_zlxz    |`,
    radar: [
        {
            source: ['gr.xidian.edu.cn/'],
        },
    ],
};
async function handler(ctx) {
    const { category = 'home_tzgg1' } = ctx.req.param();
    const url = `${baseUrl}/${struct[category].path}.htm`;
    const response = await got(url);
    const $ = load(response.data);
    if (['yyjs_jbqk', 'yyjs_jbqk1', 'yyjs_jbqk2', 'yyjs_jbqk4'].includes(category)) {
        return {
            title: $('.right-bt-left').text(),
            link: url,
            item: [
                {
                    title: $('.right-bt-left').text(),
                    link: url,
                    description: $('.main-right').html(),
                },
            ],
        };
    }
    let items = $(struct[category].selector.list)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('a').text(),
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('span').text()),
            };
        });
    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`xidian:gr:content:v2:${item.link}`, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                });
                const content = load(detailResponse.data);
                const body = content('[name="_newscontent_fromname"] .v_news_content');
                content('[name="_newscontent_fromname"] a[href*="download.jsp"]')
                    .filter((_, attachment) => !content(attachment).closest('.v_news_content').length)
                    .each((_, attachment) => {
                        body.append(content('<p/>').append(attachment));
                    });
                return { description: body.html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
