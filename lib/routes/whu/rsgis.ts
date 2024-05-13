import { Route, Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { load, Cheerio, AnyNode } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { Context } from 'hono';

const baseUrl = 'http://rsgis.whu.edu.cn';
const categoryMap = {
    index: {
        name: '首页',
        path: '',
    },
    xyxw: {
        name: '学院新闻',
        path: 'xyxw1',
        sub: {
            xyyw: {
                name: '学院要闻',
                path: 'xyyw2',
            },
            hzjl: {
                name: '合作交流',
                path: 'hzjl',
            },
            mtjj: {
                name: '媒体聚焦',
                path: 'mtjj',
            },
            xgyw: {
                name: '学工要闻',
                path: 'xgyw',
            },
        },
    },
    kxyj: {
        name: '科学研究',
        path: 'kxyj',
        sub: {
            xsbg: {
                name: '学术报告',
                path: 'xsbg',
            },
            xsjl: {
                name: '学术交流',
                path: 'xsjl',
            },
            kycg: {
                name: '学术成果',
                path: 'kycg',
            },
            sbxx: {
                name: '申报信息',
                path: 'sbxx',
            },
        },
    },
    tzgg: {
        name: '通知公告',
        path: 'tzgg1',
        sub: {
            xytz: {
                name: '学院通知',
                path: 'xytz',
            },
            jxdt: {
                name: '教学动态',
                path: 'jxdt',
            },
            xsdt: {
                name: '学术动态',
                path: 'xsdt',
            },
            rcyj: {
                name: '人才引进',
                path: 'rcyj',
            },
        },
    },
};

/**
 * Check whether the link is external.
 *
 * @param link Post link
 * @returns Whether or not weixin post
 */
function checkExternal(link: string): boolean {
    const matchWeixin = link.match(/^((http:\/\/)|(https:\/\/))?([\dA-Za-z]([\dA-Za-z-]{0,61}[\dA-Za-z])?\.)+[A-Za-z]{2,6}(\/)/);
    return !!(matchWeixin && matchWeixin.length > 0);
}

/**
 * Get information from a list of paired link and date.
 *
 * @param element
 * @returns A list of RSS meta node.
 */
function parseListLinkDateItem(element: Cheerio<AnyNode>, currentUrl: string) {
    const linkElement = element.find('a').first();
    const title = linkElement.text();
    const href = linkElement.attr('href');
    if (href === undefined) {
        throw 'Cannot get link';
    }
    const external = checkExternal(href);
    const link = external ? href : `${currentUrl}/${href}`;
    const pubDate = element.find('div.date1').first().text();
    return {
        title,
        link,
        pubDate: parseDate(pubDate, 8),
        description: title,
        external,
    };
}

async function getDetail(ctx: Context, item: Data) {
    if (item.external) {
        return `<a href="${item.link}">阅读原文</a>`;
    }
    const desc = await cache.tryGet(`whu:rsgis:${item.link}`, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const title = $('div.content div.content_title h1').first().text();
        const content = $('div.content div.v_news_content').first();
        return {
            title,
            description: content.html(),
        };
    });
    return desc;
}

/**
 * Process index type.
 *
 * @param ctx Context
 */
async function handleIndex(ctx): Promise<Array<Data>> {
    const url = `${baseUrl}/index.htm`;
    const response = await ofetch(url);
    const $ = load(response);
    // 学院新闻
    const xyxwList: Array<Data> = $('div.main1 > div.newspaper:nth-child(1) > div.newspaper_list > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // 通知公告
    const tzggList: Array<Data> = $('div.main1 > div.newspaper:nth-child(2) > div.newspaper_list > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // 学术动态
    const xsdtList: Array<Data> = $('div.main3 div.inner > div.newspaper:nth-child(1) > ul.newspaper_list2 > li:nth-child(1) > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // 学术进展
    const xsjzList: Array<Data> = $('div.main3 div.inner > div.newspaper:nth-child(1) > ul.newspaper_list2 > li:nth-child(2) > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // 教学动态
    const jxdtList: Array<Data> = $('div.main3 div.inner > div.newspaper:nth-child(2) > div.newspaper_list2 > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // 学工动态
    const xgdtList: Array<Data> = $('div.main3 div.inner > div.newspaper:nth-child(3) > div.newspaper_list2 > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // 组合所有新闻
    const fullList = await Promise.all(
        new Array<Data>().concat(xyxwList, tzggList, xsdtList, xsjzList, jxdtList, xgdtList).map(async (item) => ({
            ...item,
            ...(await getDetail(ctx, item)),
        }))
    );
    return fullList;
}

/**
 * Process non-index types.
 *
 * @param ctx Context
 * @param type Level 1 type
 * @param sub Level 2 type
 */
async function handlePostList(ctx: any, type: string, sub: string): Promise<Array<Data>> {
    const urlList: Array<{ url: string; base: string }> = [];
    const category = categoryMap[type];
    if (sub === 'all') {
        const subMap = category.sub;
        for (const key in subMap) {
            if (Object.hasOwn(subMap, key)) {
                const subType = subMap[key];
                urlList.push({
                    url: `${baseUrl}/${category.path}/${subType.path}.htm`,
                    base: `${baseUrl}/${category.path}`,
                });
            }
        }
    } else if (sub in category.sub) {
        urlList.push({
            url: `${baseUrl}/${category.path}/${category.sub[sub].path}.htm`,
            base: `${baseUrl}/${category.path}`,
        });
    } else {
        throw 'No such sub type.';
    }
    const urlPosts = await Promise.all(
        urlList.map(async (url) => {
            const response = await ofetch(url.url);
            const $ = load(response);
            return $('div.neiinner > div.nav_right > div.right_inner > div.list > ul > li')
                .toArray()
                .map((item) => parseListLinkDateItem($(item), url.base));
        })
    );
    const fullList = await Promise.all(
        urlPosts.flat().map(async (item) => ({
            ...item,
            ...(await getDetail(ctx, item)),
        }))
    );
    return fullList;
}

export const route: Route = {
    path: '/rsgis/:type/:sub?',
    categories: ['university'],
    example: '/whu/rsgis/index',
    parameters: {
        type: '栏目，详见表格',
        sub: '子栏目。当 `type` 为 `index` 的时候不起效；当 `type` 为其他合法值时，默认为 `all` 表示所有子类，其他可选项见下表。',
    },
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
            source: ['github.com/:user/:repo/issues', 'github.com/:user/:repo/issues/:id', 'github.com/:user/:repo'],
            target: '/issue/:user/:repo',
        },
    ],
    name: 'Repo Issues',
    maintainers: ['HenryQW', 'AndreyMZ'],
    description: `

|  分类名  | \`type\` 值 |  子类名  | \`sub\` 值 |
| :------: | :-------- | :------: | :------- |
|   首页   | \`index\`   |          |          |
| 学院新闻 | \`xyxw\`    |   全部   | \`all\`    |
|          |           | 学院要闻 | \`xyyw\`   |
|          |           | 合作交流 | \`hzjl\`   |
|          |           | 媒体聚焦 | \`mtjj\`   |
|          |           | 学工要闻 | \`xgyw\`   |
| 科学研究 | \`kxyj\`    |   全部   | \`all\`    |
|          |           | 学术报告 | \`xsbg\`   |
|          |           | 学术交流 | \`xsjl\`   |
|          |           | 学术成果 | \`kycg\`   |
|          |           | 申报信息 | \`sbxx\`   |
| 通知公告 | \`tzgg\`    |   全部   | \`all\`    |
|          |           | 学院通知 | \`xytz\`   |
|          |           | 教学动态 | \`jxdt\`   |
|          |           | 学术动态 | \`xsdt\`   |
|          |           | 人才引进 | \`rcyj\`   |
`,
    handler: async (ctx: Context) => {
        const { type = 'index', sub = 'all' } = ctx.req.param();
        let itemList: Array<Data> = [];
        switch (type) {
            case 'index':
                itemList = await handleIndex(ctx);
                break;
            case 'xyxw':
            case 'kxyj':
            case 'tzgg':
                itemList = await handlePostList(ctx, type, sub);
                break;
            default:
                throw 'No such type';
        }

        return {
            title: `${categoryMap[type].name} - 武汉大学遥感信息工程学院`,
            link: baseUrl,
            description: `${categoryMap[type].name} - 武汉大学遥感信息工程学院`,
            item: itemList,
        };
    },
};
