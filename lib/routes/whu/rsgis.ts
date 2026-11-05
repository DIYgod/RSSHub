import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface Post extends DataItem {
    external: boolean;
}
class ArticleAccessError extends Error {}
function requiresArticleAuthentication($: CheerioAPI) {
    if ($('title').text() === '系统提示' && $('.prompt p').text().trim() === '暂无权限，请咨询管理员。') {
        return true;
    }
    return (
        !$('.v_news_content').length &&
        $('script')
            .toArray()
            .some((element) => /^\s*window\.location\.href\s*=\s*['"]https:\/\/cas\.whu\.edu\.cn\/authserver\/login\?service=/.test($(element).text()))
    );
}
const baseUrl = 'https://rsgis.whu.edu.cn';
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
 * Get information from a list of paired link and date.
 *
 * @param element
 * @returns A list of RSS meta node.
 */
function parseListLinkDateItem(element: Cheerio<Element>, currentUrl: string) {
    const linkElement = element.find('a');
    const title = linkElement.attr('title') || linkElement.text();
    const href = linkElement.attr('href');
    if (href === undefined) {
        throw new Error('Cannot get link');
    }
    const articleUrl = new URL(href, currentUrl);
    const external = articleUrl.hostname !== new URL(baseUrl).hostname;
    const link = articleUrl.href;
    const pubDate = element.find('div.date1').text();
    return {
        title,
        link,
        pubDate: parseCalendarDate(pubDate),
        description: title,
        external,
    };
}
function parseCalendarDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value.trim(), 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
async function getDetail(item: Post): Promise<Post> {
    const link = item.link;
    if (!link) {
        return item;
    }
    if (item.external) {
        return { ...item, description: undefined };
    }
    try {
        const detail = await cache.tryGet(`whu:rsgis:article:${link}`, async () => {
            const response = await ofetch(link);
            const $ = load(response);
            if ($('title').text() === '用户验证' && $('body').text().includes('验证码')) {
                throw new ArticleAccessError(`Article access verification required at ${link}`);
            }
            if (requiresArticleAuthentication($)) {
                throw new ArticleAccessError(`Article access permission or authentication required at ${link}`);
            }
            const body = $('div.content div.v_news_content');
            if (body.length !== 1) {
                throw new Error(`Article body not found at ${link}`);
            }
            const category = $('meta[name="Keywords"]').attr('content')?.split(/\s+/).filter(Boolean);
            return {
                category: category?.length ? category : undefined,
                title: $('div.content div.content_title h1').text(),
                listTitle: item.title,
                description: body.html(),
            };
        });
        return { ...item, title: detail.listTitle === item.title ? detail.title || item.title : item.title, description: detail.description, category: detail.category };
    } catch (error) {
        if (error instanceof ArticleAccessError) {
            return { ...item, description: undefined };
        }
        throw error;
    }
}
/**
 * Process index type.
 */
async function handleIndex(): Promise<Post[]> {
    const url = `${baseUrl}/index.htm`;
    const response = await ofetch(url);
    const $ = load(response);
    // School news
    const xyxwList: Post[] = $('div.main1 > div.newspaper:nth-child(1) > div.newspaper_list > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // Notices
    const tzggList: Post[] = $('div.main1 > div.newspaper:nth-child(2) > div.newspaper_list > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // Academic updates
    const xsdtList: Post[] = $('div.main3 div.inner > div.newspaper:nth-child(1) > ul.newspaper_list2 > li:nth-child(1) > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // Academic progress
    const xsjzList: Post[] = $('div.main3 div.inner > div.newspaper:nth-child(1) > ul.newspaper_list2 > li:nth-child(2) > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // Teaching updates
    const jxdtList: Post[] = $('div.main3 div.inner > div.newspaper:nth-child(2) > div.newspaper_list2 > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // Student affairs updates
    const xgdtList: Post[] = $('div.main3 div.inner > div.newspaper:nth-child(3) > div.newspaper_list2 > ul > li')
        .toArray()
        .map((item) => parseListLinkDateItem($(item), baseUrl));
    // Combine all first-page news groups.
    const fullList = await unwrapFirstFailure(pMap([...xyxwList, ...tzggList, ...xsdtList, ...xsjzList, ...jxdtList, ...xgdtList], async (item) => await getDetail(item), { concurrency: 3, stopOnError: false }));
    return fullList;
}
/**
 * Process non-index types.
 *
 * @param type Level 1 type
 * @param sub Level 2 type
 */
async function handlePostList(type: string, sub: string): Promise<DataItem[]> {
    let urlList: Array<{
        url: string;
        base: string;
    }> = [];
    const category = categoryMap[type];
    if (sub === 'all') {
        const subMap = category.sub;
        urlList = Object.values<{
            path: string;
        }>(subMap).map((value) => {
            const subtype = value;
            return {
                url: `${baseUrl}/${category.path}/${subtype.path}.htm`,
                base: `${baseUrl}/${category.path}`,
            };
        });
    } else if (Object.hasOwn(category.sub, sub)) {
        urlList.push({
            url: `${baseUrl}/${category.path}/${category.sub[sub].path}.htm`,
            base: `${baseUrl}/${category.path}`,
        });
    } else {
        throw new Error('No such sub type.');
    }
    const urlPosts = await unwrapFirstFailure(
        pMap(
            urlList,
            async (url) => {
                const response = await ofetch(url.url);
                const $ = load(response);
                return $('div.neiinner > div.nav_right > div.right_inner > div.list > ul > li')
                    .toArray()
                    .map((item) => parseListLinkDateItem($(item), url.base));
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    const fullList = await unwrapFirstFailure(pMap(urlPosts.flat(), async (item) => await getDetail(item), { concurrency: 3, stopOnError: false }));
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
    radar: [
        {
            source: ['rsgis.whu.edu.cn/index.htm'],
            target: '/rsgis/index',
        },
    ],
    name: '遥感信息工程学院',
    maintainers: ['HPDell'],
    description: `|  分类名  | \`type\` 值 |  子类名  | \`sub\` 值 |
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
|          |           | 人才引进 | \`rcyj\`   |`,
    handler: async (ctx: Context) => {
        const { type = 'index', sub = 'all' } = ctx.req.param();
        let itemList: DataItem[];
        switch (type) {
            case 'index':
                itemList = await handleIndex();
                break;
            case 'xyxw':
            case 'kxyj':
            case 'tzgg':
                itemList = await handlePostList(type, sub);
                break;
            default:
                throw new Error('No such type');
        }
        return {
            title: `${categoryMap[type].name} - 武汉大学遥感信息工程学院`,
            link: baseUrl,
            description: `${categoryMap[type].name} - 武汉大学遥感信息工程学院`,
            item: itemList,
        };
    },
};
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
